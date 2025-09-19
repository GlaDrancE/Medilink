import type { SubscriptionStatus, SubscriptionPlan } from '@repo/db';

/**
 * Utility functions for subscription management
 */

/**
 * Validate subscription plan
 */
export function isValidSubscriptionPlan(plan: string): plan is SubscriptionPlan {
  return plan === 'MONTHLY' || plan === 'YEARLY';
}

/**
 * Validate subscription status
 */
export function isValidSubscriptionStatus(status: string): status is SubscriptionStatus {
  const validStatuses = ['ACTIVE', 'INACTIVE', 'EXPIRED', 'CANCELLED', 'GRACE_PERIOD'];
  return validStatuses.includes(status);
}

/**
 * Check if subscription status allows feature access
 */
export function allowsFeatureAccess(status: SubscriptionStatus, endDate?: Date): boolean {
  if (status === 'ACTIVE' || status === 'GRACE_PERIOD') {
    return true;
  }
  
  if (status === 'CANCELLED' && endDate) {
    // Allow access until end date for cancelled subscriptions
    return new Date() < endDate;
  }
  
  return false;
}

/**
 * Calculate prorated amount for subscription upgrade
 */
export function calculateProratedAmount(
  currentPlan: SubscriptionPlan,
  newPlan: SubscriptionPlan,
  remainingDays: number
): number {
  const { SUBSCRIPTION_PLANS } = require('@repo/db');
  
  const currentPlanConfig = SUBSCRIPTION_PLANS[currentPlan];
  const newPlanConfig = SUBSCRIPTION_PLANS[newPlan];
  
  // Calculate daily rates
  const currentDailyRate = currentPlanConfig.price / currentPlanConfig.duration;
  const newDailyRate = newPlanConfig.price / newPlanConfig.duration;
  
  // Calculate refund for remaining days of current plan
  const refundAmount = Math.floor(currentDailyRate * remainingDays);
  
  // Calculate charge for new plan
  const newPlanAmount = newPlanConfig.price;
  
  // Return the difference (what customer needs to pay)
  return Math.max(0, newPlanAmount - refundAmount);
}

/**
 * Get subscription plan display information
 */
export function getSubscriptionPlanInfo(plan: SubscriptionPlan) {
  const { SUBSCRIPTION_PLANS } = require('@repo/db');
  const planConfig = SUBSCRIPTION_PLANS[plan];
  
  return {
    ...planConfig,
    displayPrice: `₹${planConfig.price / 100}`, // Convert paise to rupees
    displayDuration: plan === 'MONTHLY' ? '1 Month' : '1 Year',
    savings: plan === 'YEARLY' ? 
      `Save ₹${((SUBSCRIPTION_PLANS.MONTHLY.price * 12) - planConfig.price) / 100}` : 
      null
  };
}

/**
 * Generate subscription summary for display
 */
export function generateSubscriptionSummary(subscription: {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  start_date: Date;
  end_date: Date;
  amount: number;
}) {
  const planInfo = getSubscriptionPlanInfo(subscription.plan);
  const now = new Date();
  const endDate = new Date(subscription.end_date);
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    planName: planInfo.name,
    status: subscription.status,
    displayPrice: planInfo.displayPrice,
    startDate: subscription.start_date.toLocaleDateString(),
    endDate: subscription.end_date.toLocaleDateString(),
    daysRemaining: Math.max(0, daysRemaining),
    isActive: allowsFeatureAccess(subscription.status, subscription.end_date),
    features: planInfo.features,
    description: planInfo.description
  };
}

/**
 * Validate subscription dates
 */
export function validateSubscriptionDates(startDate: Date, endDate: Date): boolean {
  const now = new Date();
  
  // Start date should not be in the past (with 1 minute tolerance)
  const oneMinuteAgo = new Date(now.getTime() - 60000);
  if (startDate < oneMinuteAgo) {
    return false;
  }
  
  // End date should be after start date
  if (endDate <= startDate) {
    return false;
  }
  
  // End date should not be more than 2 years in the future
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
  if (endDate > twoYearsFromNow) {
    return false;
  }
  
  return true;
}

/**
 * Get next billing date for auto-renewal
 */
export function getNextBillingDate(currentEndDate: Date, plan: SubscriptionPlan): Date {
  const { calculateSubscriptionEndDate } = require('@repo/db');
  return calculateSubscriptionEndDate(currentEndDate, plan);
}

/**
 * Check if subscription is eligible for renewal
 */
export function isEligibleForRenewal(
  status: SubscriptionStatus,
  endDate: Date,
  autoRenew: boolean
): boolean {
  if (!autoRenew) {
    return false;
  }
  
  if (status !== 'ACTIVE' && status !== 'GRACE_PERIOD') {
    return false;
  }
  
  // Check if we're within 7 days of expiry
  const now = new Date();
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
}

/**
 * Format subscription error messages
 */
export function formatSubscriptionError(error: unknown): string {
  if (error instanceof Error) {
    // Map common error messages to user-friendly ones
    const errorMappings: Record<string, string> = {
      'Doctor not found': 'Account not found. Please contact support.',
      'No active subscription to upgrade': 'You need an active subscription to upgrade.',
      'No active subscription to cancel': 'No active subscription found to cancel.',
      'Failed to create subscription': 'Unable to create subscription. Please try again.',
      'Failed to upgrade subscription': 'Unable to upgrade subscription. Please try again.',
      'Failed to cancel subscription': 'Unable to cancel subscription. Please contact support.'
    };
    
    return errorMappings[error.message] || 'An unexpected error occurred. Please try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Generate subscription analytics data
 */
export function generateSubscriptionAnalytics(subscriptions: any[]) {
  const analytics = {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: 0,
    monthlySubscriptions: 0,
    yearlySubscriptions: 0,
    totalRevenue: 0,
    averageSubscriptionValue: 0,
    churnRate: 0,
    renewalRate: 0
  };
  
  let cancelledCount = 0;
  let renewedCount = 0;
  
  subscriptions.forEach(sub => {
    if (sub.status === 'ACTIVE') {
      analytics.activeSubscriptions++;
    }
    
    if (sub.plan === 'MONTHLY') {
      analytics.monthlySubscriptions++;
    } else if (sub.plan === 'YEARLY') {
      analytics.yearlySubscriptions++;
    }
    
    analytics.totalRevenue += sub.amount;
    
    if (sub.status === 'CANCELLED') {
      cancelledCount++;
    }
    
    // This would need more complex logic to determine renewals
    // For now, we'll use a simple heuristic
  });
  
  analytics.averageSubscriptionValue = analytics.totalSubscriptions > 0 ? 
    analytics.totalRevenue / analytics.totalSubscriptions : 0;
  
  analytics.churnRate = analytics.totalSubscriptions > 0 ? 
    (cancelledCount / analytics.totalSubscriptions) * 100 : 0;
  
  return analytics;
}