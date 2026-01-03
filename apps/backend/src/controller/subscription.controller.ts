import { Request, Response } from 'express';
import { subscriptionService } from '../services/subscription.service';
import {
    isValidSubscriptionPlan,
    generateSubscriptionSummary,
    formatSubscriptionError
} from '../utils/subscription.utils';
import {
    createPaymentError,
    createErrorResponse,
    logPaymentError,
    PAYMENT_ERROR_CODES
} from '../utils/payment-error.handler';

/**
 * Get current subscription status for authenticated doctor
 */
export const getSubscriptionStatus = async (req: Request, res: Response) => {
    try {
        const doctorId = req.userId as string;

        if (!doctorId) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS,
                'Doctor ID not found in request',
                'Please log in again.'
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        const status = await subscriptionService.checkSubscriptionStatus(doctorId);

        // Generate user-friendly summary if subscription exists
        let subscriptionSummary = null;
        if (status.subscription) {
            subscriptionSummary = generateSubscriptionSummary(status.subscription);
        }

        res.status(200).json({
            success: true,
            data: {
                status: status.status,
                isActive: status.isActive,
                expiresAt: status.expiresAt,
                daysUntilExpiry: status.daysUntilExpiry,
                subscription: subscriptionSummary
            }
        });
    } catch (error) {
        console.error('Error getting subscription status:', error);
        const paymentError = createPaymentError(
            PAYMENT_ERROR_CODES.DATABASE_ERROR,
            (error as Error).message,
            'Unable to fetch subscription status. Please try again.'
        );
        logPaymentError(paymentError, { doctorId: req.userId });
        res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
    }
};

/**
 * Create new subscription for authenticated doctor
 */
export const createSubscription = async (req: Request, res: Response) => {
    try {
        const doctorId = req.userId as string;
        const { plan } = req.body;

        if (!doctorId) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS,
                'Doctor ID not found in request'
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        if (!plan || !isValidSubscriptionPlan(plan)) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.INVALID_PLAN,
                'Invalid subscription plan provided'
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        // Check if doctor already has active subscription
        const currentStatus = await subscriptionService.checkSubscriptionStatus(doctorId);
        if (currentStatus.isActive) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.SUBSCRIPTION_ALREADY_ACTIVE,
                'Doctor already has active subscription'
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        const subscription = await subscriptionService.createSubscription(doctorId, plan);
        const subscriptionSummary = generateSubscriptionSummary(subscription);

        res.status(201).json({
            success: true,
            data: {
                subscription: subscriptionSummary,
                message: 'Subscription created successfully'
            }
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        const paymentError = createPaymentError(
            PAYMENT_ERROR_CODES.DATABASE_ERROR,
            (error as Error).message,
            formatSubscriptionError(error)
        );
        logPaymentError(paymentError, { doctorId: req.userId, plan: req.body.plan });
        res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
    }
};

/**
 * Upgrade subscription plan for authenticated doctor
 */
export const upgradeSubscription = async (req: Request, res: Response) => {
    try {
        const doctorId = req.userId as string;
        const { newPlan } = req.body;

        if (!doctorId) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS,
                'Doctor ID not found in request'
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        if (!newPlan || !isValidSubscriptionPlan(newPlan)) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.INVALID_PLAN,
                'Invalid subscription plan provided'
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        const subscription = await subscriptionService.upgradeSubscription(doctorId, newPlan);
        const subscriptionSummary = generateSubscriptionSummary(subscription);

        res.status(200).json({
            success: true,
            data: {
                subscription: subscriptionSummary,
                message: 'Subscription upgraded successfully'
            }
        });
    } catch (error) {
        console.error('Error upgrading subscription:', error);
        const paymentError = createPaymentError(
            PAYMENT_ERROR_CODES.UPGRADE_NOT_ALLOWED,
            (error as Error).message,
            formatSubscriptionError(error)
        );
        logPaymentError(paymentError, { doctorId: req.userId, newPlan: req.body.newPlan });
        res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
    }
};

/**
 * Cancel subscription for authenticated doctor
 */
export const cancelSubscription = async (req: Request, res: Response) => {
    try {
        const doctorId = req.userId as string;

        if (!doctorId) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS,
                'Doctor ID not found in request'
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        await subscriptionService.cancelSubscription(doctorId);

        res.status(200).json({
            success: true,
            data: {
                message: 'Subscription cancelled successfully. Access will continue until the end of your billing period.'
            }
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        const paymentError = createPaymentError(
            PAYMENT_ERROR_CODES.CANCELLATION_NOT_ALLOWED,
            (error as Error).message,
            formatSubscriptionError(error)
        );
        logPaymentError(paymentError, { doctorId: req.userId });
        res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
    }
};

/**
 * Get subscription history for authenticated doctor
 */
export const getSubscriptionHistory = async (req: Request, res: Response) => {
    try {
        const doctorId = req.userId as string;

        if (!doctorId) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS,
                'Doctor ID not found in request'
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        const subscriptions = await subscriptionService.getSubscriptionHistory(doctorId);
        const subscriptionSummaries = subscriptions.map(sub => generateSubscriptionSummary(sub));

        res.status(200).json({
            success: true,
            data: {
                subscriptions: subscriptionSummaries,
                total: subscriptions.length
            }
        });
    } catch (error) {
        console.error('Error getting subscription history:', error);
        const paymentError = createPaymentError(
            PAYMENT_ERROR_CODES.DATABASE_ERROR,
            (error as Error).message,
            'Unable to fetch subscription history. Please try again.'
        );
        logPaymentError(paymentError, { doctorId: req.userId });
        res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
    }
};

/**
 * Check feature access for authenticated doctor
 */
export const checkFeatureAccess = async (req: Request, res: Response) => {
    try {
        const doctorId = req.userId as string;
        const { feature } = req.params;

        if (!doctorId) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS,
                'Doctor ID not found in request'
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        if (!feature) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.INVALID_AMOUNT,
                'Feature name is required'
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        const hasAccess = await subscriptionService.hasFeatureAccess(doctorId, feature);

        res.status(200).json({
            success: true,
            data: {
                feature,
                hasAccess,
                message: hasAccess ? 'Access granted' : 'Subscription required for this feature'
            }
        });
    } catch (error) {
        console.error('Error checking feature access:', error);
        const paymentError = createPaymentError(
            PAYMENT_ERROR_CODES.DATABASE_ERROR,
            (error as Error).message,
            'Unable to check feature access. Please try again.'
        );
        logPaymentError(paymentError, { doctorId: req.userId, feature: req.params.feature });
        res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
    }
};