import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscription.service';
import { SUBSCRIPTION_CONSTANTS, isPremiumFeature } from '../constants/subscription.constants';
import { 
  createPaymentError,
  createErrorResponse,
  PAYMENT_ERROR_CODES
} from '../utils/payment-error.handler';

/**
 * Access Control Manager for subscription-based features
 */
export class AccessControlManager {
  private static instance: AccessControlManager;
  private featureConfig: Map<string, FeatureConfig> = new Map();

  private constructor() {
    this.initializeFeatureConfig();
  }

  public static getInstance(): AccessControlManager {
    if (!AccessControlManager.instance) {
      AccessControlManager.instance = new AccessControlManager();
    }
    return AccessControlManager.instance;
  }

  /**
   * Initialize feature configuration
   */
  private initializeFeatureConfig(): void {
    // Configure premium features
    this.featureConfig.set('NEW_PATIENT', {
      requiresSubscription: true,
      allowGracePeriod: true,
      rateLimit: { maxUsage: 50, windowMs: 24 * 60 * 60 * 1000 }, // 50 per day
      minimumPlan: 'MONTHLY',
      description: 'Add new patients to your practice'
    });

    this.featureConfig.set('CREATE_PRESCRIPTION', {
      requiresSubscription: true,
      allowGracePeriod: true,
      rateLimit: { maxUsage: 100, windowMs: 24 * 60 * 60 * 1000 }, // 100 per day
      minimumPlan: 'MONTHLY',
      description: 'Create and manage prescriptions'
    });

    this.featureConfig.set('SEND_REMINDER', {
      requiresSubscription: true,
      allowGracePeriod: false, // Strict for SMS/WhatsApp costs
      rateLimit: { maxUsage: 20, windowMs: 24 * 60 * 60 * 1000 }, // 20 per day
      minimumPlan: 'MONTHLY',
      description: 'Send SMS/WhatsApp reminders to patients'
    });

    // Configure free features
    this.featureConfig.set('VIEW_PATIENTS', {
      requiresSubscription: false,
      allowGracePeriod: true,
      description: 'View existing patients'
    });

    this.featureConfig.set('VIEW_PRESCRIPTIONS', {
      requiresSubscription: false,
      allowGracePeriod: true,
      description: 'View existing prescriptions'
    });
  }

  /**
   * Check if doctor has access to a specific feature
   */
  async checkFeatureAccess(
    doctorId: string,
    feature: string
  ): Promise<AccessCheckResult> {
    try {
      const featureConfig = this.featureConfig.get(feature);
      
      if (!featureConfig) {
        return {
          hasAccess: false,
          reason: 'FEATURE_NOT_FOUND',
          message: 'Feature not found or not configured'
        };
      }

      // If feature doesn't require subscription, allow access
      if (!featureConfig.requiresSubscription) {
        return {
          hasAccess: true,
          reason: 'FREE_FEATURE'
        };
      }

      // Check subscription status
      const subscriptionStatus = await subscriptionService.checkSubscriptionStatus(doctorId);

      // Check if subscription is active
      if (subscriptionStatus.isActive) {
        // Check if plan meets minimum requirements
        if (featureConfig.minimumPlan && subscriptionStatus.subscription) {
          const hasRequiredPlan = this.checkPlanRequirement(
            subscriptionStatus.subscription.plan,
            featureConfig.minimumPlan
          );

          if (!hasRequiredPlan) {
            return {
              hasAccess: false,
              reason: 'INSUFFICIENT_PLAN',
              message: `This feature requires ${featureConfig.minimumPlan} plan or higher`,
              subscriptionStatus
            };
          }
        }

        return {
          hasAccess: true,
          reason: 'ACTIVE_SUBSCRIPTION',
          subscriptionStatus
        };
      }

      // Check grace period access
      if (featureConfig.allowGracePeriod && subscriptionStatus.status === 'GRACE_PERIOD') {
        return {
          hasAccess: true,
          reason: 'GRACE_PERIOD',
          message: 'Access granted during grace period',
          subscriptionStatus,
          warning: `Grace period expires in ${subscriptionStatus.daysUntilExpiry || 0} days`
        };
      }

      // Access denied
      let reason: AccessDeniedReason = 'NO_SUBSCRIPTION';
      let message = 'This feature requires an active subscription';

      if (subscriptionStatus.status === 'EXPIRED') {
        reason = 'SUBSCRIPTION_EXPIRED';
        message = 'Your subscription has expired. Please renew to continue.';
      } else if (subscriptionStatus.status === 'CANCELLED') {
        reason = 'SUBSCRIPTION_CANCELLED';
        message = 'Your subscription has been cancelled. Please subscribe again.';
      }

      return {
        hasAccess: false,
        reason,
        message,
        subscriptionStatus
      };
    } catch (error) {
      console.error('Error checking feature access:', error);
      return {
        hasAccess: false,
        reason: 'ERROR',
        message: 'Unable to verify feature access'
      };
    }
  }

  /**
   * Check if current plan meets minimum requirement
   */
  private checkPlanRequirement(currentPlan: string, minimumPlan: string): boolean {
    const planHierarchy = { 'MONTHLY': 1, 'YEARLY': 2 };
    const currentLevel = planHierarchy[currentPlan as keyof typeof planHierarchy] || 0;
    const requiredLevel = planHierarchy[minimumPlan as keyof typeof planHierarchy] || 0;
    
    return currentLevel >= requiredLevel;
  }

  /**
   * Create middleware for feature access control
   */
  createFeatureMiddleware(feature: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // const doctorId = req.userId as string;

        // if (!doctorId) {
        //   const error = createPaymentError(
        //     PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS,
        //     'Doctor ID not found in request'
        //   );
        //   return res.status(error.httpStatus).json(createErrorResponse(error));
        // }

        // const accessResult = await this.checkFeatureAccess(doctorId, feature);

        // if (!accessResult.hasAccess) {
        //   const errorCode = this.getErrorCodeForReason(accessResult.reason);
        //   const error = createPaymentError(
        //     errorCode,
        //     `Access denied for feature: ${feature}`,
        //     accessResult.message || 'Access denied'
        //   );

        //   return res.status(error.httpStatus).json({
        //     ...createErrorResponse(error),
        //     subscriptionRequired: true,
        //     feature,
        //     subscriptionStatus: accessResult.subscriptionStatus
        //   });
        // }

        // // Add access info to response headers
        // if (accessResult.warning) {
        //   res.setHeader('X-Access-Warning', accessResult.warning);
        // }
        
        // res.setHeader('X-Feature-Access', 'granted');
        // res.setHeader('X-Access-Reason', accessResult.reason);

        next();
      } catch (error) {
        console.error('Error in feature access middleware:', error);
        const paymentError = createPaymentError(
          PAYMENT_ERROR_CODES.DATABASE_ERROR,
          (error as Error).message,
          'Unable to verify feature access'
        );
        res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
      }
    };
  }

  /**
   * Get error code for access denied reason
   */
  private getErrorCodeForReason(reason: AccessDeniedReason): string {
    const reasonToErrorCode: Record<AccessDeniedReason, string> = {
      'NO_SUBSCRIPTION': PAYMENT_ERROR_CODES.FEATURE_ACCESS_DENIED,
      'SUBSCRIPTION_EXPIRED': PAYMENT_ERROR_CODES.SUBSCRIPTION_EXPIRED,
      'SUBSCRIPTION_CANCELLED': PAYMENT_ERROR_CODES.FEATURE_ACCESS_DENIED,
      'INSUFFICIENT_PLAN': PAYMENT_ERROR_CODES.UPGRADE_NOT_ALLOWED,
      'FEATURE_NOT_FOUND': PAYMENT_ERROR_CODES.INVALID_AMOUNT,
      'ERROR': PAYMENT_ERROR_CODES.DATABASE_ERROR
    };

    return reasonToErrorCode[reason] || PAYMENT_ERROR_CODES.FEATURE_ACCESS_DENIED;
  }

  /**
   * Get feature configuration
   */
  getFeatureConfig(feature: string): FeatureConfig | undefined {
    return this.featureConfig.get(feature);
  }

  /**
   * Get all configured features
   */
  getAllFeatures(): Map<string, FeatureConfig> {
    return new Map(this.featureConfig);
  }

  /**
   * Update feature configuration
   */
  updateFeatureConfig(feature: string, config: Partial<FeatureConfig>): void {
    const existingConfig = this.featureConfig.get(feature);
    if (existingConfig) {
      this.featureConfig.set(feature, { ...existingConfig, ...config });
    } else {
      this.featureConfig.set(feature, config as FeatureConfig);
    }
  }

  /**
   * Bulk check multiple features for a doctor
   */
  async checkMultipleFeatures(
    doctorId: string,
    features: string[]
  ): Promise<Record<string, AccessCheckResult>> {
    const results: Record<string, AccessCheckResult> = {};

    // Get subscription status once for efficiency
    const subscriptionStatus = await subscriptionService.checkSubscriptionStatus(doctorId);

    for (const feature of features) {
      const featureConfig = this.featureConfig.get(feature);
      
      if (!featureConfig) {
        results[feature] = {
          hasAccess: false,
          reason: 'FEATURE_NOT_FOUND',
          message: 'Feature not found'
        };
        continue;
      }

      if (!featureConfig.requiresSubscription) {
        results[feature] = {
          hasAccess: true,
          reason: 'FREE_FEATURE'
        };
        continue;
      }

      // Use the same logic as single feature check
      if (subscriptionStatus.isActive) {
        results[feature] = {
          hasAccess: true,
          reason: 'ACTIVE_SUBSCRIPTION',
          subscriptionStatus
        };
      } else if (featureConfig.allowGracePeriod && subscriptionStatus.status === 'GRACE_PERIOD') {
        results[feature] = {
          hasAccess: true,
          reason: 'GRACE_PERIOD',
          subscriptionStatus,
          warning: `Grace period expires in ${subscriptionStatus.daysUntilExpiry || 0} days`
        };
      } else {
        results[feature] = {
          hasAccess: false,
          reason: subscriptionStatus.status === 'EXPIRED' ? 'SUBSCRIPTION_EXPIRED' : 'NO_SUBSCRIPTION',
          message: 'Subscription required',
          subscriptionStatus
        };
      }
    }

    return results;
  }
}

/**
 * Feature configuration interface
 */
interface FeatureConfig {
  requiresSubscription: boolean;
  allowGracePeriod: boolean;
  rateLimit?: {
    maxUsage: number;
    windowMs: number;
  };
  minimumPlan?: 'MONTHLY' | 'YEARLY';
  description: string;
}

/**
 * Access check result interface
 */
interface AccessCheckResult {
  hasAccess: boolean;
  reason: AccessGrantedReason | AccessDeniedReason;
  message?: string;
  subscriptionStatus?: any;
  warning?: string;
}

type AccessGrantedReason = 'FREE_FEATURE' | 'ACTIVE_SUBSCRIPTION' | 'GRACE_PERIOD';
type AccessDeniedReason = 'NO_SUBSCRIPTION' | 'SUBSCRIPTION_EXPIRED' | 'SUBSCRIPTION_CANCELLED' | 'INSUFFICIENT_PLAN' | 'FEATURE_NOT_FOUND' | 'ERROR';

// Export singleton instance
export const accessControlManager = AccessControlManager.getInstance();