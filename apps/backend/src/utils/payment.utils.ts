import type { PaymentStatus, SubscriptionPlan } from '@repo/db';
import { SUBSCRIPTION_PLANS } from '@repo/db';
import type { PaymentVerificationRequest } from '../types/razorpay.types';

/**
 * Payment utility functions
 */

/**
 * Validate payment verification request
 */
export function validatePaymentVerification(verification: PaymentVerificationRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!verification.razorpay_order_id) {
    errors.push('Order ID is required');
  }

  if (!verification.razorpay_payment_id) {
    errors.push('Payment ID is required');
  }

  if (!verification.razorpay_signature) {
    errors.push('Payment signature is required');
  }

  // Validate format of IDs
  if (verification.razorpay_order_id && !verification.razorpay_order_id.startsWith('order_')) {
    errors.push('Invalid order ID format');
  }

  if (verification.razorpay_payment_id && !verification.razorpay_payment_id.startsWith('pay_')) {
    errors.push('Invalid payment ID format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate subscription order request
 */
export function validateSubscriptionOrderRequest(request: {
  doctorId: string;
  plan: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
}): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!request.doctorId) {
    errors.push('Doctor ID is required');
  }

  if (!request.plan || !isValidSubscriptionPlan(request.plan)) {
    errors.push('Valid subscription plan is required');
  }

  if (!request.customerInfo) {
    errors.push('Customer information is required');
  } else {
    if (!request.customerInfo.name || request.customerInfo.name.trim().length < 2) {
      errors.push('Customer name must be at least 2 characters');
    }

    if (!request.customerInfo.email || !isValidEmail(request.customerInfo.email)) {
      errors.push('Valid email address is required');
    }

    if (request.customerInfo.phone && !isValidPhone(request.customerInfo.phone)) {
      errors.push('Invalid phone number format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if subscription plan is valid
 */
export function isValidSubscriptionPlan(plan: string): plan is SubscriptionPlan {
  return plan === 'MONTHLY' || plan === 'YEARLY';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Indian format)
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check for Indian mobile number format
  // Should be 10 digits starting with 6-9, or 11 digits starting with 91
  return /^[6-9]\d{9}$/.test(cleanPhone) || /^91[6-9]\d{9}$/.test(cleanPhone);
}

/**
 * Format payment amount for display
 */
export function formatPaymentAmount(amount: number, currency: string = 'INR'): string {
  const displayAmount = amount / 100; // Convert paise to rupees
  
  if (currency === 'INR') {
    return `₹${displayAmount.toLocaleString('en-IN')}`;
  }
  
  return `${currency} ${displayAmount.toFixed(2)}`;
}

/**
 * Calculate payment processing fee (if applicable)
 */
export function calculateProcessingFee(amount: number): number {
  // Razorpay charges approximately 2% + GST
  // This is just an example calculation
  const feePercentage = 0.024; // 2.4% (including GST)
  return Math.round(amount * feePercentage);
}

/**
 * Generate payment description
 */
export function generatePaymentDescription(plan: SubscriptionPlan, doctorName: string): string {
  const planConfig = SUBSCRIPTION_PLANS[plan];
  return `${planConfig.name} subscription for Dr. ${doctorName}`;
}

/**
 * Check if payment status is final
 */
export function isPaymentStatusFinal(status: PaymentStatus): boolean {
  return status === 'SUCCESS' || status === 'FAILED' || status === 'REFUNDED';
}

/**
 * Get payment status display information
 */
export function getPaymentStatusInfo(status: PaymentStatus): {
  label: string;
  color: string;
  description: string;
} {
  const statusMap = {
    PENDING: {
      label: 'Pending',
      color: 'yellow',
      description: 'Payment is being processed'
    },
    SUCCESS: {
      label: 'Success',
      color: 'green',
      description: 'Payment completed successfully'
    },
    FAILED: {
      label: 'Failed',
      color: 'red',
      description: 'Payment could not be processed'
    },
    REFUNDED: {
      label: 'Refunded',
      color: 'blue',
      description: 'Payment has been refunded'
    }
  };

  return statusMap[status] || {
    label: 'Unknown',
    color: 'gray',
    description: 'Unknown payment status'
  };
}

/**
 * Calculate subscription savings for yearly plan
 */
export function calculateYearlySavings(): number {
  const monthlyTotal = SUBSCRIPTION_PLANS.MONTHLY.price * 12;
  const yearlyPrice = SUBSCRIPTION_PLANS.YEARLY.price;
  return monthlyTotal - yearlyPrice;
}

/**
 * Generate payment receipt data
 */
export function generatePaymentReceipt(payment: {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: Date;
  payment_method?: string;
}, subscription: {
  plan: SubscriptionPlan;
  start_date: Date;
  end_date: Date;
}, doctor: {
  name: string;
  email: string;
}) {
  const planConfig = SUBSCRIPTION_PLANS[subscription.plan];
  
  return {
    receiptId: payment.id,
    date: payment.created_at.toLocaleDateString('en-IN'),
    customerName: doctor.name,
    customerEmail: doctor.email,
    planName: planConfig.name,
    planDuration: planConfig.duration === 30 ? '1 Month' : '1 Year',
    amount: formatPaymentAmount(payment.amount, payment.currency),
    paymentMethod: payment.payment_method || 'Online',
    subscriptionPeriod: {
      start: subscription.start_date.toLocaleDateString('en-IN'),
      end: subscription.end_date.toLocaleDateString('en-IN')
    },
    status: getPaymentStatusInfo(payment.status).label,
    features: planConfig.features
  };
}

/**
 * Validate refund request
 */
export function validateRefundRequest(
  paymentAmount: number,
  refundAmount?: number
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (refundAmount !== undefined) {
    if (refundAmount <= 0) {
      errors.push('Refund amount must be greater than 0');
    }

    if (refundAmount > paymentAmount) {
      errors.push('Refund amount cannot exceed payment amount');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if payment is eligible for refund
 */
export function isEligibleForRefund(
  paymentStatus: PaymentStatus,
  paymentDate: Date,
  refundWindowDays: number = 7
): boolean {
  if (paymentStatus !== 'SUCCESS') {
    return false;
  }

  const now = new Date();
  const daysSincePayment = Math.ceil((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysSincePayment <= refundWindowDays;
}

/**
 * Format error message for payment failures
 */
export function formatPaymentError(error: unknown): string {
  if (error instanceof Error) {
    // Map common Razorpay errors to user-friendly messages
    const errorMappings: Record<string, string> = {
      'Payment failed': 'Your payment could not be processed. Please try again.',
      'Invalid signature': 'Payment verification failed. Please contact support.',
      'Order not found': 'Payment order not found. Please try again.',
      'Payment not captured': 'Payment was not completed. Please try again.',
      'Insufficient funds': 'Insufficient funds in your account. Please try with a different payment method.',
      'Card declined': 'Your card was declined. Please try with a different card.',
      'Network error': 'Network error occurred. Please check your connection and try again.'
    };

    return errorMappings[error.message] || 'Payment processing failed. Please try again or contact support.';
  }

  return 'An unexpected error occurred during payment processing.';
}