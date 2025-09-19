import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscription.service';
import { 
  createPaymentError,
  createErrorResponse,
  logPaymentError,
  PAYMENT_ERROR_CODES
} from '../utils/payment-error.handler';
import { SUBSCRIPTION_CONSTANTS, isPremiumFeature } from '../constants/subscription.constants';

/**
 * Enhanced request interface with subscription information
 */
interface RequestWithSubscription extends Request {
  subscriptionStatus?: {
    status: string;
    isActive: boolean;
    subscription?: any;
    expiresAt?: Date;
    daysUntilExpiry?: number;
  };
}

/**
 * Middleware to check subscription access for premium features
 */
export const requireSubscriptionAccess = (feature: string) => {
  return async (req: RequestWithSubscription, res: Response, next: NextFunction) => {
    try {
      const doctorId = req.userId as string;

      if (!doctorId) {
        const error = createPaymentError(
          PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS,
          'Doctor ID not found in request',
          'Please log in again to continue.'
        );
        return res.status(error.httpStatus).json(createErrorResponse(error));
      }

      // Check if feature requires subscription
      if (!isPremiumFeature(feature)) {
        // Non-premium feature, allow access
        return next();
      }

      // Check subscription access
      const hasAccess = await subscriptionService.hasFeatureAccess(doctorId, feature);

      if (!hasAccess) {
        // Get subscription status for detailed error message
        const status = await subscriptionService.checkSubscriptionStatus(doctorId);
        
        let userMessage = 'This feature requires an active subscription.';
        let errorCode = PAYMENT_ERROR_CODES.FEATURE_ACCESS_DENIED;

        if (status.status === 'EXPIRED') {
          userMessage = 'Your subscription has expired. Please renew to continue using this feature.';
          errorCode = PAYMENT_ERROR_CODES.SUBSCRIPTION_EXPIRED;
        } else if (status.status === 'CANCELLED') {
          userMessage = 'Your subscription has been cancelled. Please subscribe again to use this feature.';
        } else if (status.status === 'GRACE_PERIOD') {
          userMessage = `Your subscription expired but you're in a grace period. Please renew within ${status.daysUntilExpiry || 0} days.`;
        }

        const error = createPaymentError(
          errorCode,
          `Access denied for feature: ${feature}`,
          userMessage
        );

        logPaymentError(error, { 
          doctorId, 
          feature, 
          subscriptionStatus: status.status,
          expiresAt: status.expiresAt 
        });

        return res.status(error.httpStatus).json({
          ...createErrorResponse(error),
          subscriptionRequired: true,
          subscriptionStatus: {
            status: status.status,
            isActive: status.isActive,
            expiresAt: status.expiresAt,
            daysUntilExpiry: status.daysUntilExpiry
          }
        });
      }

      // Access granted, continue to next middleware
      next();
    } catch (error) {
      console.error('Error in subscription access middleware:', error);
      const paymentError = createPaymentError(
        PAYMENT_ERROR_CODES.DATABASE_ERROR,
        (error as Error).message,
        'Unable to verify subscription access. Please try again.'
      );
      logPaymentError(paymentError, { doctorId: req.userId, feature });
      res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
    }
  };
};

/**
 * Middleware to add subscription status to request object
 */
export const addSubscriptionContext = async (
  req: RequestWithSubscription,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctorId = req.userId as string;

    if (doctorId) {
      const status = await subscriptionService.checkSubscriptionStatus(doctorId);
      req.subscriptionStatus = status;
    }

    next();
  } catch (error) {
    console.error('Error adding subscription context:', error);
    // Don't block the request, just continue without subscription context
    next();
  }
};

/**
 * Middleware to check if doctor has any active subscription
 */
export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctorId = req.userId as string;

    if (!doctorId) {
      const error = createPaymentError(
        PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS,
        'Doctor ID not found in request'
      );
      return res.status(error.httpStatus).json(createErrorResponse(error));
    }

    const status = await subscriptionService.checkSubscriptionStatus(doctorId);

    if (!status.isActive) {
      const error = createPaymentError(
        PAYMENT_ERROR_CODES.SUBSCRIPTION_EXPIRED,
        'No active subscription found',
        'An active subscription is required to access this feature.'
      );
      return res.status(error.httpStatus).json({
        ...createErrorResponse(error),
        subscriptionRequired: true,
        subscriptionStatus: status
      });
    }

    next();
  } catch (error) {
    console.error('Error checking active subscription:', error);
    const paymentError = createPaymentError(
      PAYMENT_ERROR_CODES.DATABASE_ERROR,
      (error as Error).message,
      'Unable to verify subscription status. Please try again.'
    );
    res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
  }
};

/**
 * Middleware to check subscription expiry and send warnings
 */
export const checkSubscriptionExpiry = async (
  req: RequestWithSubscription,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctorId = req.userId as string;

    if (doctorId) {
      const status = await subscriptionService.checkSubscriptionStatus(doctorId);
      
      // Add expiry warning to response headers if subscription is expiring soon
      if (status.isActive && status.daysUntilExpiry !== undefined) {
        if (status.daysUntilExpiry <= 7 && status.daysUntilExpiry > 0) {
          res.setHeader('X-Subscription-Warning', 'expiring-soon');
          res.setHeader('X-Days-Until-Expiry', status.daysUntilExpiry.toString());
        } else if (status.daysUntilExpiry <= 0) {
          res.setHeader('X-Subscription-Warning', 'expired');
        }
      }
    }

    next();
  } catch (error) {
    console.error('Error checking subscription expiry:', error);
    // Don't block the request, just continue
    next();
  }
};

/**
 * Middleware for specific premium features
 */
export const requireNewPatientAccess = requireSubscriptionAccess('NEW_PATIENT');
export const requirePrescriptionAccess = requireSubscriptionAccess('CREATE_PRESCRIPTION');
export const requireReminderAccess = requireSubscriptionAccess('SEND_REMINDER');

/**
 * Middleware to handle subscription upgrade prompts
 */
export const handleSubscriptionUpgrade = (requiredPlan?: 'MONTHLY' | 'YEARLY') => {
  return async (req: RequestWithSubscription, res: Response, next: NextFunction) => {
    try {
      const doctorId = req.userId as string;

      if (!doctorId) {
        return next();
      }

      const status = await subscriptionService.checkSubscriptionStatus(doctorId);

      // If user has subscription but it's lower tier, suggest upgrade
      if (status.isActive && status.subscription && requiredPlan) {
        const currentPlan = status.subscription.plan;
        
        if (requiredPlan === 'YEARLY' && currentPlan === 'MONTHLY') {
          res.setHeader('X-Subscription-Upgrade-Available', 'true');
          res.setHeader('X-Suggested-Plan', 'YEARLY');
        }
      }

      next();
    } catch (error) {
      console.error('Error in subscription upgrade middleware:', error);
      // Don't block the request
      next();
    }
  };
};

/**
 * Middleware to track feature usage for analytics
 */
export const trackFeatureUsage = (feature: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = req.userId as string;

      if (doctorId) {
        // Log feature usage for analytics
        console.log(`Feature usage: ${feature} by doctor ${doctorId} at ${new Date().toISOString()}`);
        
        // In production, you might want to store this in a database
        // or send to an analytics service
      }

      next();
    } catch (error) {
      console.error('Error tracking feature usage:', error);
      // Don't block the request
      next();
    }
  };
};

/**
 * Middleware to handle grace period access
 */
export const allowGracePeriodAccess = (feature: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = req.userId as string;

      if (!doctorId) {
        const error = createPaymentError(
          PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS,
          'Doctor ID not found in request'
        );
        return res.status(error.httpStatus).json(createErrorResponse(error));
      }

      const status = await subscriptionService.checkSubscriptionStatus(doctorId);

      // Allow access if active or in grace period
      if (status.isActive || status.status === 'GRACE_PERIOD') {
        // Add grace period warning if applicable
        if (status.status === 'GRACE_PERIOD') {
          res.setHeader('X-Grace-Period-Warning', 'true');
          res.setHeader('X-Days-Remaining', (status.daysUntilExpiry || 0).toString());
        }
        return next();
      }

      // Deny access
      const error = createPaymentError(
        PAYMENT_ERROR_CODES.FEATURE_ACCESS_DENIED,
        `Access denied for feature: ${feature}`,
        'This feature requires an active subscription.'
      );

      return res.status(error.httpStatus).json({
        ...createErrorResponse(error),
        subscriptionRequired: true,
        subscriptionStatus: status
      });
    } catch (error) {
      console.error('Error in grace period access middleware:', error);
      const paymentError = createPaymentError(
        PAYMENT_ERROR_CODES.DATABASE_ERROR,
        (error as Error).message,
        'Unable to verify subscription access. Please try again.'
      );
      res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
    }
  };
};

/**
 * Middleware to rate limit premium feature usage
 */
export const rateLimitPremiumFeature = (feature: string, maxUsage: number, windowMs: number) => {
  const usageTracker = new Map<string, { count: number; resetTime: number }>();

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = req.userId as string;

      if (!doctorId) {
        return next();
      }

      const now = Date.now();
      const key = `${doctorId}:${feature}`;
      const usage = usageTracker.get(key);

      if (!usage || now > usage.resetTime) {
        // Reset or initialize usage
        usageTracker.set(key, { count: 1, resetTime: now + windowMs });
        return next();
      }

      if (usage.count >= maxUsage) {
        const error = createPaymentError(
          PAYMENT_ERROR_CODES.FEATURE_ACCESS_DENIED,
          `Rate limit exceeded for feature: ${feature}`,
          `You have reached the maximum usage limit for ${feature}. Please try again later.`
        );
        return res.status(error.httpStatus).json(createErrorResponse(error));
      }

      // Increment usage
      usage.count++;
      usageTracker.set(key, usage);

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', maxUsage.toString());
      res.setHeader('X-RateLimit-Remaining', (maxUsage - usage.count).toString());
      res.setHeader('X-RateLimit-Reset', new Date(usage.resetTime).toISOString());

      next();
    } catch (error) {
      console.error('Error in rate limit middleware:', error);
      // Don't block the request on rate limit errors
      next();
    }
  };
};