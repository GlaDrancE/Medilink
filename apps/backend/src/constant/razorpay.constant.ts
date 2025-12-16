// Razorpay-related constants

export const RAZORPAY_CONSTANTS = {
    // Currency
    DEFAULT_CURRENCY: 'INR',

    // Order status
    ORDER_STATUS: {
        CREATED: 'created',
        ATTEMPTED: 'attempted',
        PAID: 'paid'
    } as const,

    // Payment status
    PAYMENT_STATUS: {
        CREATED: 'created',
        AUTHORIZED: 'authorized',
        CAPTURED: 'captured',
        REFUNDED: 'refunded',
        FAILED: 'failed'
    } as const,

    // Webhook events we handle
    WEBHOOK_EVENTS: {
        PAYMENT_AUTHORIZED: 'payment.authorized',
        PAYMENT_CAPTURED: 'payment.captured',
        PAYMENT_FAILED: 'payment.failed',
        ORDER_PAID: 'order.paid',
        REFUND_CREATED: 'refund.created',
        REFUND_PROCESSED: 'refund.processed'
    } as const,

    // Receipt prefixes for different types of orders
    RECEIPT_PREFIXES: {
        SUBSCRIPTION: 'sub_',
        UPGRADE: 'upg_',
        RENEWAL: 'ren_'
    } as const,

    // Order notes keys
    ORDER_NOTES: {
        DOCTOR_ID: 'doctor_id',
        SUBSCRIPTION_PLAN: 'subscription_plan',
        ORDER_TYPE: 'order_type',
        CREATED_BY: 'created_by'
    } as const,

    // Timeout settings (in milliseconds)
    TIMEOUTS: {
        ORDER_CREATION: 30000, // 30 seconds
        PAYMENT_VERIFICATION: 15000, // 15 seconds
        WEBHOOK_PROCESSING: 10000 // 10 seconds
    } as const,

    // Retry settings
    RETRY: {
        MAX_ATTEMPTS: 3,
        DELAY_MS: 1000,
        BACKOFF_MULTIPLIER: 2
    } as const
} as const;

// Helper function to generate receipt ID
export function generateReceiptId(type: keyof typeof RAZORPAY_CONSTANTS.RECEIPT_PREFIXES, doctorId: string): string {
    const prefix = RAZORPAY_CONSTANTS.RECEIPT_PREFIXES[type];
    const timestamp = Date.now();
    return `${prefix}${doctorId.slice(-8)}_${timestamp}`;
}

// Helper function to create order notes
export function createOrderNotes(doctorId: string, plan: string, orderType: string): Record<string, string> {
    return {
        [RAZORPAY_CONSTANTS.ORDER_NOTES.DOCTOR_ID]: doctorId,
        [RAZORPAY_CONSTANTS.ORDER_NOTES.SUBSCRIPTION_PLAN]: plan,
        [RAZORPAY_CONSTANTS.ORDER_NOTES.ORDER_TYPE]: orderType,
        [RAZORPAY_CONSTANTS.ORDER_NOTES.CREATED_BY]: 'medilink_backend'
    };
}