import type { PaymentStatus } from '@repo/db';

/**
 * Payment error handling utilities
 */

export interface PaymentError {
    code: string;
    message: string;
    userMessage: string;
    retryable: boolean;
    httpStatus: number;
}

/**
 * Payment error codes
 */
export const PAYMENT_ERROR_CODES = {
    // Validation errors
    INVALID_AMOUNT: 'PAYMENT_001',
    INVALID_PLAN: 'PAYMENT_002',
    INVALID_CUSTOMER_INFO: 'PAYMENT_003',
    INVALID_SIGNATURE: 'PAYMENT_004',

    // Razorpay errors
    ORDER_CREATION_FAILED: 'PAYMENT_101',
    PAYMENT_CAPTURE_FAILED: 'PAYMENT_102',
    PAYMENT_NOT_FOUND: 'PAYMENT_103',
    ORDER_NOT_FOUND: 'PAYMENT_104',

    // Business logic errors
    SUBSCRIPTION_ALREADY_ACTIVE: 'PAYMENT_201',
    DOCTOR_NOT_FOUND: 'PAYMENT_202',
    DUPLICATE_PAYMENT: 'PAYMENT_203',
    CANCELLATION_NOT_ALLOWED: "PAYMENT_204",
    // Network/System errors
    NETWORK_ERROR: 'PAYMENT_301',
    DATABASE_ERROR: 'PAYMENT_302',
    EXTERNAL_SERVICE_ERROR: 'PAYMENT_303',

    // Security errors
    SIGNATURE_VERIFICATION_FAILED: 'PAYMENT_401',
    UNAUTHORIZED_ACCESS: 'PAYMENT_402',

    // Generic errors
    UNKNOWN_ERROR: 'PAYMENT_999',

    // Payment upgrade errors
    UPGRADE_NOT_ALLOWED: 'PAYMENT_501',


} as const;

/**
 * Create standardized payment error
 */
export function createPaymentError(
    code: string,
    message: string,
    userMessage?: string,
    retryable: boolean = false
): PaymentError {
    return {
        code,
        message,
        userMessage: userMessage || getDefaultUserMessage(code),
        retryable,
        httpStatus: getHttpStatusForError(code)
    };
}

/**
 * Get default user-friendly message for error code
 */
function getDefaultUserMessage(code: string): string {
    const messages: Record<string, string> = {
        [PAYMENT_ERROR_CODES.INVALID_AMOUNT]: 'Invalid payment amount. Please try again.',
        [PAYMENT_ERROR_CODES.INVALID_PLAN]: 'Invalid subscription plan selected.',
        [PAYMENT_ERROR_CODES.INVALID_CUSTOMER_INFO]: 'Please provide valid customer information.',
        [PAYMENT_ERROR_CODES.INVALID_SIGNATURE]: 'Payment verification failed. Please contact support.',

        [PAYMENT_ERROR_CODES.ORDER_CREATION_FAILED]: 'Unable to create payment order. Please try again.',
        [PAYMENT_ERROR_CODES.PAYMENT_CAPTURE_FAILED]: 'Payment could not be processed. Please try again.',
        [PAYMENT_ERROR_CODES.PAYMENT_NOT_FOUND]: 'Payment not found. Please contact support.',
        [PAYMENT_ERROR_CODES.ORDER_NOT_FOUND]: 'Order not found. Please try again.',

        [PAYMENT_ERROR_CODES.SUBSCRIPTION_ALREADY_ACTIVE]: 'You already have an active subscription.',
        [PAYMENT_ERROR_CODES.DOCTOR_NOT_FOUND]: 'Account not found. Please contact support.',
        [PAYMENT_ERROR_CODES.DUPLICATE_PAYMENT]: 'This payment has already been processed.',

        [PAYMENT_ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
        [PAYMENT_ERROR_CODES.DATABASE_ERROR]: 'System error. Please try again later.',
        [PAYMENT_ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'Payment service temporarily unavailable. Please try again.',

        [PAYMENT_ERROR_CODES.SIGNATURE_VERIFICATION_FAILED]: 'Payment verification failed. Please contact support.',
        [PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS]: 'Unauthorized access. Please log in again.',

        [PAYMENT_ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again or contact support.'
    };

    return messages[code] || 'An error occurred during payment processing.';
}

/**
 * Get HTTP status code for error
 */
function getHttpStatusForError(code: string): number {
    if (code.startsWith('PAYMENT_0')) return 400; // Validation errors
    if (code.startsWith('PAYMENT_1')) return 502; // External service errors
    if (code.startsWith('PAYMENT_2')) return 409; // Business logic errors
    if (code.startsWith('PAYMENT_3')) return 503; // System errors
    if (code.startsWith('PAYMENT_4')) return 401; // Security errors
    return 500; // Unknown errors
}

/**
 * Handle Razorpay specific errors
 */
export function handleRazorpayError(error: any): PaymentError {
    if (error.statusCode) {
        switch (error.statusCode) {
            case 400:
                return createPaymentError(
                    PAYMENT_ERROR_CODES.INVALID_AMOUNT,
                    error.error?.description || 'Invalid request',
                    'Please check your payment details and try again.',
                    true
                );
            case 401:
                return createPaymentError(
                    PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS,
                    'Authentication failed',
                    'Authentication error. Please contact support.',
                    false
                );
            case 404:
                return createPaymentError(
                    PAYMENT_ERROR_CODES.ORDER_NOT_FOUND,
                    'Order not found',
                    'Payment order not found. Please try again.',
                    true
                );
            case 500:
                return createPaymentError(
                    PAYMENT_ERROR_CODES.EXTERNAL_SERVICE_ERROR,
                    'Razorpay service error',
                    'Payment service temporarily unavailable. Please try again.',
                    true
                );
            default:
                return createPaymentError(
                    PAYMENT_ERROR_CODES.EXTERNAL_SERVICE_ERROR,
                    error.error?.description || 'Razorpay error',
                    'Payment processing error. Please try again.',
                    true
                );
        }
    }

    return createPaymentError(
        PAYMENT_ERROR_CODES.UNKNOWN_ERROR,
        error.message || 'Unknown Razorpay error',
        'Payment processing failed. Please try again.',
        true
    );
}

/**
 * Handle database errors
 */
export function handleDatabaseError(error: any): PaymentError {
    console.error('Database error:', error);

    return createPaymentError(
        PAYMENT_ERROR_CODES.DATABASE_ERROR,
        error.message || 'Database operation failed',
        'System error. Please try again later.',
        true
    );
}

/**
 * Handle network errors
 */
export function handleNetworkError(error: any): PaymentError {
    return createPaymentError(
        PAYMENT_ERROR_CODES.NETWORK_ERROR,
        error.message || 'Network error',
        'Network error. Please check your connection and try again.',
        true
    );
}

/**
 * Log payment error for monitoring
 */
export function logPaymentError(error: PaymentError, context?: any): void {
    const logData = {
        timestamp: new Date().toISOString(),
        errorCode: error.code,
        message: error.message,
        userMessage: error.userMessage,
        retryable: error.retryable,
        httpStatus: error.httpStatus,
        context
    };

    console.error('Payment Error:', JSON.stringify(logData, null, 2));

    // In production, you might want to send this to a logging service
    // like Winston, Sentry, or CloudWatch
}

/**
 * Create error response for API
 */
export function createErrorResponse(error: PaymentError) {
    return {
        success: false,
        error: {
            code: error.code,
            message: error.userMessage,
            retryable: error.retryable
        },
        timestamp: new Date().toISOString()
    };
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: PaymentError): boolean {
    return error.retryable;
}

/**
 * Get retry delay based on attempt number
 */
export function getRetryDelay(attemptNumber: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    return Math.min(1000 * Math.pow(2, attemptNumber - 1), 30000); // Max 30 seconds
}

/**
 * Sanitize error for client response (remove sensitive information)
 */
export function sanitizeErrorForClient(error: any): PaymentError {
    // Never expose internal error details to client
    if (error.code && error.userMessage) {
        return error as PaymentError;
    }

    return createPaymentError(
        PAYMENT_ERROR_CODES.UNKNOWN_ERROR,
        'Internal error',
        'An error occurred. Please try again or contact support.',
        false
    );
}