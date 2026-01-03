import Razorpay from 'razorpay';
import crypto from 'crypto';

// Razorpay configuration interface
export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

// Get Razorpay configuration from environment variables
export function getRazorpayConfig(): RazorpayConfig {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay configuration is missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
  }

  if (!webhookSecret) {
    console.warn('RAZORPAY_WEBHOOK_SECRET is not set. Webhook signature verification will be disabled.');
  }

  return {
    keyId,
    keySecret,
    webhookSecret: webhookSecret || ''
  };
}

// Create Razorpay instance
export function createRazorpayInstance(): Razorpay {
  const config = getRazorpayConfig();
  
  return new Razorpay({
    key_id: config.keyId,
    key_secret: config.keySecret,
  });
}

// Verify Razorpay webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Verify Razorpay payment signature
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  try {
    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
}

// Razorpay order options interface
export interface CreateOrderOptions {
  amount: number; // in paise
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

// Razorpay payment verification interface
export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Export singleton instance
export const razorpayInstance = createRazorpayInstance();