// Custom Razorpay type definitions for our application

export interface RazorpayOrderRequest {
    amount: number; // in paise
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
}

export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    offer_id?: string;
    status: 'created' | 'attempted' | 'paid';
    attempts: number;
    notes: Record<string, string>;
    created_at: number;
}

export interface RazorpayPayment {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
    order_id: string;
    invoice_id?: string;
    international: boolean;
    method: string;
    amount_refunded: number;
    refund_status?: string;
    captured: boolean;
    description?: string;
    card_id?: string;
    bank?: string;
    wallet?: string;
    vpa?: string;
    email: string;
    contact: string;
    notes: Record<string, string>;
    fee?: number;
    tax?: number;
    error_code?: string;
    error_description?: string;
    error_source?: string;
    error_step?: string;
    error_reason?: string;
    acquirer_data?: Record<string, any>;
    created_at: number;
}

export interface RazorpayWebhookPayload {
    entity: string;
    account_id: string;
    event: string;
    contains: string[];
    payload: {
        payment?: {
            entity: RazorpayPayment;
        };
        order?: {
            entity: RazorpayOrder;
        };
    };
    created_at: number;
}

export interface PaymentVerificationRequest {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface CreateSubscriptionOrderRequest {
    doctorId: string;
    plan: 'MONTHLY' | 'YEARLY';
    customerInfo: {
        name: string;
        email: string;
        phone?: string;
    };
}

export interface SubscriptionOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    customerInfo: {
        name: string;
        email: string;
        phone?: string;
    };
    notes: Record<string, string>;
}

// Razorpay error types
export interface RazorpayError {
    statusCode: number;
    error: {
        code: string;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata: Record<string, any>;
    };
}

// Webhook event types
export type RazorpayWebhookEvent =
    | 'payment.authorized'
    | 'payment.captured'
    | 'payment.failed'
    | 'order.paid'
    | 'refund.created'
    | 'refund.processed';

// Payment method types
export type PaymentMethod =
    | 'card'
    | 'netbanking'
    | 'wallet'
    | 'upi'
    | 'emi'
    | 'cardless_emi'
    | 'paylater';

// Currency codes supported by Razorpay
export type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'SGD' | 'AED';