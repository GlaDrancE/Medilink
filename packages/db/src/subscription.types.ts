import { SubscriptionPlan } from "./generated/prisma/client";

export interface SubscriptionPlanConfig {
    id: SubscriptionPlan;
    name: string;
    price: number; // in paise (smallest currency unit)
    duration: number; // in days
    features: string[];
    description: string;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanConfig> = {
    MONTHLY: {
        id: 'MONTHLY',
        name: 'Monthly Plan',
        price: 9900, // ₹99 in paise
        duration: 30, // 30 days
        features: [
            'unlimited_patients',
            'prescriptions',
            'reminders',
            'basic_support'
        ],
        description: 'Perfect for getting started with all essential features'
    },
    YEARLY: {
        id: 'YEARLY',
        name: 'Yearly Plan',
        price: 99900, // ₹999 in paise
        duration: 365, // 365 days
        features: [
            'unlimited_patients',
            'prescriptions',
            'reminders',
            'priority_support',
            'advanced_analytics',
            'bulk_operations'
        ],
        description: 'Best value with all features and priority support'
    }
};

export const PREMIUM_FEATURES = [
    'NEW_PATIENT',
    'CREATE_PRESCRIPTION',
    'SEND_REMINDER'
] as const;

export type PremiumFeature = typeof PREMIUM_FEATURES[number];

// Helper function to get plan by ID
export function getSubscriptionPlan(planId: SubscriptionPlan): SubscriptionPlanConfig {
    return SUBSCRIPTION_PLANS[planId];
}

// Helper function to calculate subscription end date
export function calculateSubscriptionEndDate(startDate: Date, plan: SubscriptionPlan): Date {
    const config = getSubscriptionPlan(plan);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + config.duration);
    return endDate;
}

// Helper function to check if subscription is active
export function isSubscriptionActive(
    status: string,
    endDate: Date | null
): boolean {
    if (status !== 'ACTIVE') return false;
    if (!endDate) return false;
    return new Date() < endDate;
}

// Helper function to check if subscription is in grace period
export function isInGracePeriod(
    status: string,
    endDate: Date | null,
    graceDays: number = 3
): boolean {
    if (status !== 'GRACE_PERIOD') return false;
    if (!endDate) return false;

    const gracePeriodEnd = new Date(endDate);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + graceDays);

    return new Date() < gracePeriodEnd;
}