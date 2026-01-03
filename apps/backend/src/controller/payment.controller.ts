import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import {
    validateSubscriptionOrderRequest,
    validatePaymentVerification,
    formatPaymentAmount
} from '../utils/payment.utils';
import {
    createPaymentError,
    createErrorResponse,
    logPaymentError,
    handleRazorpayError,
    PAYMENT_ERROR_CODES
} from '../utils/payment-error.handler';
import { SUBSCRIPTION_PLANS, SubscriptionPlan, SubscriptionPlanConfig } from '@repo/db';
import type { CreateSubscriptionOrderRequest, PaymentVerificationRequest } from '../types/razorpay.types';

/**
 * Create Razorpay order for subscription payment
 */
export const createPaymentOrder = async (req: Request, res: Response) => {
    try {
        const doctorId = req.userId as string;
        const { plan, customerInfo } = req.body;

        if (!doctorId) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS,
                'Doctor ID not found in request'
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        // Validate request
        const validation = validateSubscriptionOrderRequest({
            doctorId,
            plan,
            customerInfo
        });

        if (!validation.isValid) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.INVALID_CUSTOMER_INFO,
                'Validation failed',
                validation.errors.join(', ')
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        const orderRequest: CreateSubscriptionOrderRequest = {
            doctorId,
            plan,
            customerInfo
        };

        const orderResponse = await paymentService.createSubscriptionOrder(orderRequest);

        res.status(201).json({
            success: true,
            data: {
                orderId: orderResponse.orderId,
                amount: orderResponse.amount,
                currency: orderResponse.currency,
                keyId: orderResponse.keyId,
                customerInfo: orderResponse.customerInfo,
                displayAmount: formatPaymentAmount(orderResponse.amount, orderResponse.currency),
                planDetails: SUBSCRIPTION_PLANS[plan as SubscriptionPlan]
            }
        });
    } catch (error) {
        console.error('Error creating payment order:', error);

        let paymentError;
        if (error && typeof error === 'object' && 'statusCode' in error) {
            paymentError = handleRazorpayError(error);
        } else {
            paymentError = createPaymentError(
                PAYMENT_ERROR_CODES.ORDER_CREATION_FAILED,
                (error as Error).message,
                'Unable to create payment order. Please try again.'
            );
        }

        logPaymentError(paymentError, { doctorId: req.userId, plan: req.body.plan });
        res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
    }
};

/**
 * Verify payment signature and process successful payment
 */
export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const doctorId = req.userId as string;
        const paymentData = req.body as PaymentVerificationRequest;

        if (!doctorId) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS,
                'Doctor ID not found in request'
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        // Validate payment verification data
        const validation = validatePaymentVerification(paymentData);
        if (!validation.isValid) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.INVALID_SIGNATURE,
                'Payment verification data is invalid',
                validation.errors.join(', ')
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        const result = await paymentService.verifyAndProcessPayment(paymentData);

        if (result.success) {
            res.status(200).json({
                success: true,
                data: {
                    paymentId: result.paymentId,
                    subscriptionId: result.subscriptionId,
                    message: 'Payment verified and subscription activated successfully'
                }
            });
        } else {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.SIGNATURE_VERIFICATION_FAILED,
                'Payment verification failed',
                'Payment could not be verified. Please contact support if amount was debited.'
            );
            logPaymentError(error, { doctorId, paymentId: result.paymentId });
            res.status(error.httpStatus).json(createErrorResponse(error));
        }
    } catch (error) {
        console.error('Error verifying payment:', error);

        let paymentError;
        if (error && typeof error === 'object' && 'statusCode' in error) {
            paymentError = handleRazorpayError(error);
        } else {
            paymentError = createPaymentError(
                PAYMENT_ERROR_CODES.PAYMENT_CAPTURE_FAILED,
                (error as Error).message,
                'Payment verification failed. Please contact support if amount was debited.'
            );
        }

        logPaymentError(paymentError, { doctorId: req.userId, paymentData: req.body });
        res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
    }
};

/**
 * Get payment history for authenticated doctor
 */
// export const getPaymentHistory = async (req: Request, res: Response) => {
//     try {
//         const doctorId = req.userId as string;

//         if (!doctorId) {
//             const error = createPaymentError(
//                 PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS,
//                 'Doctor ID not found in request'
//             );
//             return res.status(error.httpStatus).json(createErrorResponse(error));
//         }

//         const payments = await paymentService.getPaymentHistory(doctorId);

//         // Format payments for display
//         const formattedPayments = payments.map(payment => ({
//             id: payment.id,
//             razorpayPaymentId: payment.razorpay_payment_id,
//             amount: payment.amount,
//             displayAmount: formatPaymentAmount(payment.amount, payment.currency),
//             currency: payment.currency,
//             status: payment.status,
//             paymentMethod: payment.payment_method,
//             createdAt: payment.createdAt,
//             subscription: payment.subscription ? {
//                 id: payment.subscription.id,
//                 plan: payment.subscription.plan,
//                 status: payment.subscription.status,
//                 startDate: payment.subscription.start_date,
//                 endDate: payment.subscription.end_date
//             } : null
//         }));

//         res.status(200).json({
//             success: true,
//             data: {
//                 payments: formattedPayments,
//                 total: payments.length
//             }
//         });
//     } catch (error) {
//         console.error('Error getting payment history:', error);
//         const paymentError = createPaymentError(
//             PAYMENT_ERROR_CODES.DATABASE_ERROR,
//             (error as Error).message,
//             'Unable to fetch payment history. Please try again.'
//         );
//         logPaymentError(paymentError, { doctorId: req.userId });
//         res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
//     }
// };

/**
 * Get payment statistics for authenticated doctor
 */
export const getPaymentStatistics = async (req: Request, res: Response) => {
    try {
        const doctorId = req.userId as string;

        if (!doctorId) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS,
                'Doctor ID not found in request'
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        const stats = await paymentService.getPaymentStatistics(doctorId);

        res.status(200).json({
            success: true,
            data: {
                totalPayments: stats.totalPayments,
                successfulPayments: stats.successfulPayments,
                failedPayments: stats.failedPayments,
                totalRevenue: stats.totalRevenue,
                displayTotalRevenue: formatPaymentAmount(stats.totalRevenue),
                averageOrderValue: stats.averageOrderValue,
                displayAverageOrderValue: formatPaymentAmount(stats.averageOrderValue),
                successRate: Math.round(stats.successRate * 100) / 100 // Round to 2 decimal places
            }
        });
    } catch (error) {
        console.error('Error getting payment statistics:', error);
        const paymentError = createPaymentError(
            PAYMENT_ERROR_CODES.DATABASE_ERROR,
            (error as Error).message,
            'Unable to fetch payment statistics. Please try again.'
        );
        logPaymentError(paymentError, { doctorId: req.userId });
        res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
    }
};

/**
 * Handle payment failure notification
 */
export const handlePaymentFailure = async (req: Request, res: Response) => {
    try {
        const { paymentId, reason } = req.body;

        if (!paymentId) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.INVALID_AMOUNT,
                'Payment ID is required'
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        await paymentService.handlePaymentFailure(paymentId, reason || 'Payment failed');

        res.status(200).json({
            success: true,
            data: {
                message: 'Payment failure recorded successfully'
            }
        });
    } catch (error) {
        console.error('Error handling payment failure:', error);
        const paymentError = createPaymentError(
            PAYMENT_ERROR_CODES.DATABASE_ERROR,
            (error as Error).message,
            'Unable to process payment failure. Please try again.'
        );
        logPaymentError(paymentError, { paymentId: req.body.paymentId });
        res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
    }
};

/**
 * Process refund request
 */
export const processRefund = async (req: Request, res: Response) => {
    try {
        const doctorId = req.userId as string;
        const { paymentId, amount } = req.body;

        if (!doctorId) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS,
                'Doctor ID not found in request'
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        if (!paymentId) {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.INVALID_AMOUNT,
                'Payment ID is required'
            );
            return res.status(error.httpStatus).json(createErrorResponse(error));
        }

        const result = await paymentService.processRefund(paymentId, amount);

        if (result.success) {
            res.status(200).json({
                success: true,
                data: {
                    refundId: result.refundId,
                    message: 'Refund processed successfully'
                }
            });
        } else {
            const error = createPaymentError(
                PAYMENT_ERROR_CODES.PAYMENT_CAPTURE_FAILED,
                result.error || 'Refund processing failed'
            );
            res.status(error.httpStatus).json(createErrorResponse(error));
        }
    } catch (error) {
        console.error('Error processing refund:', error);
        const paymentError = createPaymentError(
            PAYMENT_ERROR_CODES.EXTERNAL_SERVICE_ERROR,
            (error as Error).message,
            'Unable to process refund. Please contact support.'
        );
        logPaymentError(paymentError, { doctorId: req.userId, paymentId: req.body.paymentId });
        res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
    }
};