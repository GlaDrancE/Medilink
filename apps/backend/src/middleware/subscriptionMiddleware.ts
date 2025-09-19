import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscription.service';
import { 
  createPaymentError,
  createErrorResponse,
  PAYMENT_ERROR_CODES
} from '../utils/payment-error.handler';
import { SUBSCRIPTION_CONSTANTS, isPremiumFeature } from '../constants/subscription.constants';

/**
 * Middleware to check if doctor has active subscription for premium features
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

    const hasAccess = await subscriptionService.hasFeatureAccess(doctorId, 'PREMIUM_FEATURES');

    if (!hasAccess) {
      const error = createPaymentError(
        PAYMENT_ERROR_CODES.FEATURE_ACCESS_DENIED,
        'Active subscription required for this feature'
      );
      return res.status(error.httpStatus).json(createErrorResponse(error));
    }

    next();
  } catch (error) {
    console.error('Error checking subscription access:', error);
    const paymentError = createPaymentError(
      PAYMENT_ERROR_CODES.DATABASE_ERROR,
      (error as Error).message,
      'Unable to verify subscription access. Please try again.'
    );
    res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
  }
};

/**
 * Middleware to check feature-specific access
 */
export const requireFeatureAccess = (feature: string) => {
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

      // Check if feature is premium
      if (!isPremiumFeature(feature)) {
        // Non-premium feature, allow access
        return next();
      }

      const hasAccess = await subscriptionService.hasFeatureAccess(doctorId, feature);

      if (!hasAccess) {
        const error = createPaymentError(
          PAYMENT_ERROR_CODES.FEATURE_ACCESS_DENIED,
          `Active subscription required for ${feature}`,
          `This feature requires an active subscription. Please subscribe to continue.`
        );
        return res.status(error.httpStatus).json(createErrorResponse(error));
      }

      next();
    } catch (error) {
      console.error('Error checking feature access:', error);
      const paymentError = createPaymentError(
        PAYMENT_ERROR_CODES.DATABASE_ERROR,
        (error as Error).message,
        'Unable to verify feature access. Please try again.'
      );
      res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
    }
  };
};

/**
 * Middleware to add subscription status to request
 */
export const addSubscriptionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctorId = req.userId as string;

    if (doctorId) {
      const status = await subscriptionService.checkSubscriptionStatus(doctorId);
      (req as any).subscriptionStatus = status;
    }

    next();
  } catch (error) {
    console.error('Error adding subscription status:', error);
    // Don't block the request, just continue without subscription status
    next();
  }
};

/**
 * Middleware to validate subscription plan in request body
 */
export const validateSubscriptionPlan = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { plan, newPlan } = req.body;
  const planToValidate = plan || newPlan;

  if (!planToValidate) {
    const error = createPaymentError(
      PAYMENT_ERROR_CODES.INVALID_PLAN,
      'Subscription plan is required'
    );
    return res.status(error.httpStatus).json(createErrorResponse(error));
  }

  if (planToValidate !== 'MONTHLY' && planToValidate !== 'YEARLY') {
    const error = createPaymentError(
      PAYMENT_ERROR_CODES.INVALID_PLAN,
      'Invalid subscription plan. Must be MONTHLY or YEARLY'
    );
    return res.status(error.httpStatus).json(createErrorResponse(error));
  }

  next();
};

/**
 * Middleware to validate customer info in request body
 */
export const validateCustomerInfo = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { customerInfo } = req.body;

  if (!customerInfo) {
    const error = createPaymentError(
      PAYMENT_ERROR_CODES.INVALID_CUSTOMER_INFO,
      'Customer information is required'
    );
    return res.status(error.httpStatus).json(createErrorResponse(error));
  }

  const { name, email } = customerInfo;

  if (!name || name.trim().length < 2) {
    const error = createPaymentError(
      PAYMENT_ERROR_CODES.INVALID_CUSTOMER_INFO,
      'Customer name must be at least 2 characters'
    );
    return res.status(error.httpStatus).json(createErrorResponse(error));
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = createPaymentError(
      PAYMENT_ERROR_CODES.INVALID_CUSTOMER_INFO,
      'Valid email address is required'
    );
    return res.status(error.httpStatus).json(createErrorResponse(error));
  }

  next();
};

/**
 * Middleware to rate limit subscription operations
 */
export const rateLimitSubscriptionOperations = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // This is a simple implementation. In production, you might want to use
  // a more sophisticated rate limiting solution like Redis-based rate limiting
  
  const doctorId = req.userId as string;
  const operation = req.path;
  
  // For now, just log the operation for monitoring
  console.log(`Subscription operation: ${operation} by doctor: ${doctorId}`);
  
  // TODO: Implement actual rate limiting logic based on requirements
  // For example, limit upgrade attempts per day, cancellation attempts, etc.
  
  next();
};