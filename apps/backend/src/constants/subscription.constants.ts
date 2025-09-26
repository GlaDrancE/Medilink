// Subscription-related constants for the backend

export const SUBSCRIPTION_CONSTANTS = {
  // Grace period settings
  GRACE_PERIOD_DAYS: 3,
  
  // Expiry reminder settings
  EXPIRY_REMINDER_DAYS: [7, 3, 1], // Send reminders 7, 3, and 1 days before expiry
  
  // Feature access settings
  PREMIUM_FEATURES: [
    'NEW_PATIENT',
    'CREATE_PRESCRIPTION', 
    'SEND_REMINDER'
  ] as const,
  
  // Subscription limits
  LIMITS: {
    MAX_SUBSCRIPTIONS_PER_DOCTOR: 10, // Historical limit
    MAX_UPGRADE_ATTEMPTS_PER_DAY: 3,
    MAX_CANCELLATION_ATTEMPTS_PER_DAY: 2
  },
  
  // Auto-renewal settings
  AUTO_RENEWAL: {
    ENABLED_BY_DEFAULT: true,
    RENEWAL_ATTEMPT_DAYS_BEFORE_EXPIRY: 3,
    MAX_RENEWAL_ATTEMPTS: 3,
    RETRY_INTERVAL_HOURS: 24
  },
  
  // Subscription analytics
  ANALYTICS: {
    CHURN_CALCULATION_PERIOD_DAYS: 30,
    REVENUE_REPORTING_CURRENCY: 'INR',
    METRICS_RETENTION_DAYS: 365
  },
  
  // Error codes
  ERROR_CODES: {
    SUBSCRIPTION_NOT_FOUND: 'SUB_001',
    SUBSCRIPTION_ALREADY_ACTIVE: 'SUB_002',
    SUBSCRIPTION_EXPIRED: 'SUB_003',
    INVALID_PLAN: 'SUB_004',
    PAYMENT_REQUIRED: 'SUB_005',
    UPGRADE_NOT_ALLOWED: 'SUB_006',
    CANCELLATION_NOT_ALLOWED: 'SUB_007',
    FEATURE_ACCESS_DENIED: 'SUB_008'
  },
  
  // Notification settings
  NOTIFICATIONS: {
    EXPIRY_WARNING_ENABLED: true,
    RENEWAL_SUCCESS_ENABLED: true,
    CANCELLATION_CONFIRMATION_ENABLED: true,
    PAYMENT_FAILURE_ENABLED: true
  }
} as const;

// Type for premium features
export type PremiumFeature = typeof SUBSCRIPTION_CONSTANTS.PREMIUM_FEATURES[number];

// Helper function to check if a feature is premium
export function isPremiumFeature(feature: string): feature is PremiumFeature {
  return SUBSCRIPTION_CONSTANTS.PREMIUM_FEATURES.includes(feature as PremiumFeature);
}

// Helper function to get error message by code
export function getSubscriptionErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    [SUBSCRIPTION_CONSTANTS.ERROR_CODES.SUBSCRIPTION_NOT_FOUND]: 'No subscription found for this account.',
    [SUBSCRIPTION_CONSTANTS.ERROR_CODES.SUBSCRIPTION_ALREADY_ACTIVE]: 'You already have an active subscription.',
    [SUBSCRIPTION_CONSTANTS.ERROR_CODES.SUBSCRIPTION_EXPIRED]: 'Your subscription has expired. Please renew to continue.',
    [SUBSCRIPTION_CONSTANTS.ERROR_CODES.INVALID_PLAN]: 'Invalid subscription plan selected.',
    [SUBSCRIPTION_CONSTANTS.ERROR_CODES.PAYMENT_REQUIRED]: 'Payment is required to activate this subscription.',
    [SUBSCRIPTION_CONSTANTS.ERROR_CODES.UPGRADE_NOT_ALLOWED]: 'Subscription upgrade is not allowed at this time.',
    [SUBSCRIPTION_CONSTANTS.ERROR_CODES.CANCELLATION_NOT_ALLOWED]: 'Subscription cancellation is not allowed at this time.',
    [SUBSCRIPTION_CONSTANTS.ERROR_CODES.FEATURE_ACCESS_DENIED]: 'This feature requires an active subscription.'
  };
  
  return errorMessages[code] || 'An unexpected error occurred with your subscription.';
}

// Helper function to calculate grace period end date
export function calculateGracePeriodEnd(subscriptionEndDate: Date): Date {
  const gracePeriodEnd = new Date(subscriptionEndDate);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + SUBSCRIPTION_CONSTANTS.GRACE_PERIOD_DAYS);
  return gracePeriodEnd;
}

// Helper function to check if date is within expiry reminder period
export function shouldSendExpiryReminder(expiryDate: Date, lastReminderSent?: Date): boolean {
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Check if we should send a reminder based on the reminder days
  const shouldSend = SUBSCRIPTION_CONSTANTS.EXPIRY_REMINDER_DAYS.includes(daysUntilExpiry);
  
  if (!shouldSend) return false;
  
  // If we have a last reminder date, make sure we don't send duplicate reminders
  if (lastReminderSent) {
    const daysSinceLastReminder = Math.ceil((now.getTime() - lastReminderSent.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastReminder >= 1; // Don't send more than once per day
  }
  
  return true;
}