import type { RazorpayWebhookEvent } from '../types/razorpay.types';

/**
 * Webhook utility functions
 */

/**
 * Validate webhook event type
 */
export function isValidWebhookEvent(event: string): event is RazorpayWebhookEvent {
  const validEvents = [
    'payment.authorized',
    'payment.captured',
    'payment.failed',
    'order.paid',
    'refund.created',
    'refund.processed'
  ];
  
  return validEvents.includes(event);
}

/**
 * Extract doctor ID from webhook payload
 */
export function extractDoctorIdFromWebhook(payload: any): string | null {
  try {
    // Try to get from order notes
    if (payload.order?.entity?.notes?.doctor_id) {
      return payload.order.entity.notes.doctor_id;
    }
    
    // Try to get from payment notes (if available)
    if (payload.payment?.entity?.notes?.doctor_id) {
      return payload.payment.entity.notes.doctor_id;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting doctor ID from webhook:', error);
    return null;
  }
}

/**
 * Extract subscription plan from webhook payload
 */
export function extractSubscriptionPlanFromWebhook(payload: any): string | null {
  try {
    // Try to get from order notes
    if (payload.order?.entity?.notes?.subscription_plan) {
      return payload.order.entity.notes.subscription_plan;
    }
    
    // Try to get from payment notes (if available)
    if (payload.payment?.entity?.notes?.subscription_plan) {
      return payload.payment.entity.notes.subscription_plan;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting subscription plan from webhook:', error);
    return null;
  }
}

/**
 * Check if webhook event should trigger subscription activation
 */
export function shouldActivateSubscription(event: string, paymentStatus?: string): boolean {
  const activationEvents = ['payment.captured', 'payment.authorized', 'order.paid'];
  const validStatuses = ['captured', 'authorized'];
  
  if (!activationEvents.includes(event)) {
    return false;
  }
  
  if (paymentStatus && !validStatuses.includes(paymentStatus)) {
    return false;
  }
  
  return true;
}

/**
 * Generate webhook processing log entry
 */
export function createWebhookLogEntry(
  event: string,
  paymentId?: string,
  orderId?: string,
  success: boolean = true,
  error?: string
) {
  return {
    timestamp: new Date().toISOString(),
    event,
    paymentId: paymentId || null,
    orderId: orderId || null,
    success,
    error: error || null,
    processedAt: new Date()
  };
}

/**
 * Validate webhook payload structure
 */
export function validateWebhookPayload(payload: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!payload) {
    errors.push('Payload is required');
    return { isValid: false, errors };
  }
  
  if (!payload.event) {
    errors.push('Event type is required');
  }
  
  if (!payload.payload) {
    errors.push('Payload data is required');
  }
  
  if (!payload.created_at) {
    errors.push('Created timestamp is required');
  }
  
  // Validate event-specific requirements
  if (payload.event && payload.event.startsWith('payment.')) {
    if (!payload.payload?.payment?.entity) {
      errors.push('Payment entity is required for payment events');
    }
  }
  
  if (payload.event && payload.event.startsWith('order.')) {
    if (!payload.payload?.order?.entity) {
      errors.push('Order entity is required for order events');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate webhook retry delay with exponential backoff
 */
export function calculateRetryDelay(attemptNumber: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 60s
  const baseDelay = 1000; // 1 second
  const maxDelay = 60000; // 60 seconds
  
  const delay = baseDelay * Math.pow(2, attemptNumber - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Check if webhook should be retried based on error
 */
export function shouldRetryWebhook(error: any, attemptNumber: number): boolean {
  const maxAttempts = 5;
  
  if (attemptNumber >= maxAttempts) {
    return false;
  }
  
  // Don't retry for certain types of errors
  const nonRetryableErrors = [
    'Invalid signature',
    'Invalid payload format',
    'Duplicate webhook'
  ];
  
  const errorMessage = error?.message || '';
  if (nonRetryableErrors.some(msg => errorMessage.includes(msg))) {
    return false;
  }
  
  // Retry for network errors, database errors, etc.
  return true;
}

/**
 * Format webhook event for logging
 */
export function formatWebhookEventForLog(
  event: string,
  payload: any,
  result: { success: boolean; message: string }
): string {
  const logData = {
    event,
    timestamp: new Date().toISOString(),
    paymentId: payload.payment?.entity?.id,
    orderId: payload.order?.entity?.id,
    success: result.success,
    message: result.message
  };
  
  return JSON.stringify(logData, null, 2);
}

/**
 * Extract webhook metadata for analytics
 */
export function extractWebhookMetadata(payload: any) {
  return {
    event: payload.event,
    entityType: payload.contains?.[0] || 'unknown',
    paymentId: payload.payload?.payment?.entity?.id,
    orderId: payload.payload?.order?.entity?.id,
    amount: payload.payload?.payment?.entity?.amount || payload.payload?.order?.entity?.amount,
    currency: payload.payload?.payment?.entity?.currency || payload.payload?.order?.entity?.currency,
    method: payload.payload?.payment?.entity?.method,
    status: payload.payload?.payment?.entity?.status || payload.payload?.order?.entity?.status,
    createdAt: new Date(payload.created_at * 1000), // Convert Unix timestamp
    doctorId: extractDoctorIdFromWebhook(payload),
    subscriptionPlan: extractSubscriptionPlanFromWebhook(payload)
  };
}

/**
 * Generate webhook response for Razorpay
 */
export function createWebhookResponse(
  success: boolean,
  message: string,
  processed: boolean = false
) {
  return {
    success,
    message,
    processed,
    timestamp: new Date().toISOString()
  };
}

/**
 * Sanitize webhook payload for logging (remove sensitive data)
 */
export function sanitizeWebhookPayload(payload: any): any {
  const sanitized = JSON.parse(JSON.stringify(payload));
  
  // Remove sensitive fields if they exist
  const sensitiveFields = ['card', 'bank', 'vpa', 'wallet'];
  
  function removeSensitiveData(obj: any) {
    if (typeof obj !== 'object' || obj === null) return;
    
    for (const key in obj) {
      if (sensitiveFields.includes(key)) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        removeSensitiveData(obj[key]);
      }
    }
  }
  
  removeSensitiveData(sanitized);
  return sanitized;
}