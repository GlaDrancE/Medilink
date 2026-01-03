import prisma, {
    SUBSCRIPTION_PLANS,
    calculateSubscriptionEndDate,
    isSubscriptionActive,
    isInGracePeriod
} from '@repo/db';
import type {
    Doctor,
    Subscription,
    SubscriptionStatus,
    SubscriptionPlan
} from '@repo/db';

/**
 * Core subscription service for managing doctor subscriptions
 */
export class SubscriptionService {
    private static instance: SubscriptionService;

    private constructor() { }

    public static getInstance(): SubscriptionService {
        if (!SubscriptionService.instance) {
            SubscriptionService.instance = new SubscriptionService();
        }
        return SubscriptionService.instance;
    }

    /**
     * Check the current subscription status for a doctor
     */
    async checkSubscriptionStatus(doctorId: string): Promise<{
        status: SubscriptionStatus;
        isActive: boolean;
        subscription?: Subscription;
        expiresAt?: Date;
        daysUntilExpiry?: number;
    }> {
        try {
            // Get doctor with current subscription info
            const doctor = await prisma.doctor.findUnique({
                where: { id: doctorId },
                select: {
                    id: true,
                    subscription_status: true,
                    subscription_plan: true,
                    subscription_start: true,
                    subscription_end: true,
                    subscriptions: {
                        where: {
                            status: {
                                in: ['ACTIVE', 'GRACE_PERIOD']
                            }
                        },
                        orderBy: {
                            end_date: 'desc'
                        },
                        take: 1
                    }
                }
            });

            if (!doctor) {
                throw new Error('Doctor not found');
            }

            const currentSubscription = doctor.subscriptions[0];
            const status = doctor.subscription_status as SubscriptionStatus;

            // Check if subscription is actually active
            const isActive = currentSubscription ?
                isSubscriptionActive(currentSubscription.status, currentSubscription.end_date) : false;

            // Calculate days until expiry
            let daysUntilExpiry: number | undefined;
            if (currentSubscription?.end_date) {
                const now = new Date();
                const expiry = new Date(currentSubscription.end_date);
                daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            }

            return {
                status,
                isActive,
                subscription: currentSubscription || undefined,
                expiresAt: currentSubscription?.end_date || undefined,
                daysUntilExpiry
            };
        } catch (error) {
            console.error('Error checking subscription status:', error);
            throw new Error('Failed to check subscription status');
        }
    }

    /**
     * Create a new subscription for a doctor
     */
    async createSubscription(
        doctorId: string,
        plan: SubscriptionPlan,
        paymentTransactionId?: string
    ): Promise<Subscription> {
        try {
            const startDate = new Date();
            const endDate = calculateSubscriptionEndDate(startDate, plan);

            // Get plan configuration
            const planConfig = SUBSCRIPTION_PLANS[plan];

            // Create subscription in a transaction
            const result = await prisma.$transaction(async (tx) => {
                // Create the subscription record
                const subscription = await tx.subscription.create({
                    data: {
                        doctor_id: doctorId,
                        plan,
                        status: 'ACTIVE',
                        start_date: startDate,
                        end_date: endDate,
                        amount: planConfig.price,
                        currency: 'INR',
                        auto_renew: true
                    }
                });

                // Update doctor's subscription fields
                await tx.doctor.update({
                    where: { id: doctorId },
                    data: {
                        subscription_status: 'ACTIVE',
                        subscription_plan: plan,
                        subscription_start: startDate,
                        subscription_end: endDate
                    }
                });

                return subscription;
            });

            console.log(`Created ${plan} subscription for doctor ${doctorId}`);
            return result;
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw new Error('Failed to create subscription');
        }
    }

    /**
     * Upgrade a doctor's subscription plan
     */
    async upgradeSubscription(
        doctorId: string,
        newPlan: SubscriptionPlan
    ): Promise<Subscription> {
        try {
            const currentStatus = await this.checkSubscriptionStatus(doctorId);

            if (!currentStatus.isActive || !currentStatus.subscription) {
                throw new Error('No active subscription to upgrade');
            }

            const currentSubscription = currentStatus.subscription;

            // Calculate prorated amount and new end date
            const now = new Date();
            const currentEndDate = new Date(currentSubscription.end_date);
            const remainingDays = Math.ceil((currentEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            const newPlanConfig = SUBSCRIPTION_PLANS[newPlan];
            const currentPlanConfig = SUBSCRIPTION_PLANS[currentSubscription.plan];

            // Calculate new end date based on upgrade
            const newEndDate = calculateSubscriptionEndDate(now, newPlan);

            // Perform upgrade in transaction
            const result = await prisma.$transaction(async (tx) => {
                // Cancel current subscription
                await tx.subscription.update({
                    where: { id: currentSubscription.id },
                    data: {
                        status: 'CANCELLED',
                        cancelled_at: now
                    }
                });

                // Create new subscription
                const newSubscription = await tx.subscription.create({
                    data: {
                        doctor_id: doctorId,
                        plan: newPlan,
                        status: 'ACTIVE',
                        start_date: now,
                        end_date: newEndDate,
                        amount: newPlanConfig.price,
                        currency: 'INR',
                        auto_renew: true
                    }
                });

                // Update doctor's subscription fields
                await tx.doctor.update({
                    where: { id: doctorId },
                    data: {
                        subscription_status: 'ACTIVE',
                        subscription_plan: newPlan,
                        subscription_start: now,
                        subscription_end: newEndDate
                    }
                });

                return newSubscription;
            });

            console.log(`Upgraded subscription for doctor ${doctorId} from ${currentSubscription.plan} to ${newPlan}`);
            return result;
        } catch (error) {
            console.error('Error upgrading subscription:', error);
            throw new Error('Failed to upgrade subscription');
        }
    }

    /**
     * Cancel a doctor's subscription
     */
    async cancelSubscription(doctorId: string): Promise<void> {
        try {
            const currentStatus = await this.checkSubscriptionStatus(doctorId);

            if (!currentStatus.isActive || !currentStatus.subscription) {
                throw new Error('No active subscription to cancel');
            }

            const now = new Date();

            // Cancel subscription but keep access until end date
            await prisma.$transaction(async (tx) => {
                await tx.subscription.update({
                    where: { id: currentStatus.subscription!.id },
                    data: {
                        status: 'CANCELLED',
                        cancelled_at: now,
                        auto_renew: false
                    }
                });

                // Update doctor status to cancelled but keep end date
                await tx.doctor.update({
                    where: { id: doctorId },
                    data: {
                        subscription_status: 'CANCELLED'
                    }
                });
            });

            console.log(`Cancelled subscription for doctor ${doctorId}`);
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            throw new Error('Failed to cancel subscription');
        }
    }

    /**
     * Reactivate a cancelled subscription
     */
    async reactivateSubscription(
        doctorId: string,
        plan: SubscriptionPlan
    ): Promise<Subscription> {
        try {
            // Check if doctor has any recent cancelled subscription
            const doctor = await prisma.doctor.findUnique({
                where: { id: doctorId },
                include: {
                    subscriptions: {
                        where: {
                            status: 'CANCELLED'
                        },
                        orderBy: {
                            cancelled_at: 'desc'
                        },
                        take: 1
                    }
                }
            });

            if (!doctor) {
                throw new Error('Doctor not found');
            }

            // Create new subscription (similar to createSubscription)
            return await this.createSubscription(doctorId, plan);
        } catch (error) {
            console.error('Error reactivating subscription:', error);
            throw new Error('Failed to reactivate subscription');
        }
    }

    /**
     * Handle subscription expiry - move to grace period or inactive
     */
    async handleSubscriptionExpiry(doctorId: string): Promise<void> {
        try {
            const currentStatus = await this.checkSubscriptionStatus(doctorId);

            if (!currentStatus.subscription) {
                return; // No subscription to expire
            }

            const now = new Date();
            const endDate = new Date(currentStatus.subscription.end_date);

            if (now > endDate) {
                // Subscription has expired
                const gracePeriodEnd = new Date(endDate);
                gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3); // 3-day grace period

                let newStatus: SubscriptionStatus;
                if (now < gracePeriodEnd) {
                    newStatus = 'GRACE_PERIOD';
                } else {
                    newStatus = 'EXPIRED';
                }

                await prisma.$transaction(async (tx) => {
                    await tx.subscription.update({
                        where: { id: currentStatus.subscription!.id },
                        data: {
                            status: newStatus
                        }
                    });

                    await tx.doctor.update({
                        where: { id: doctorId },
                        data: {
                            subscription_status: newStatus
                        }
                    });
                });

                console.log(`Updated subscription status for doctor ${doctorId} to ${newStatus}`);
            }
        } catch (error) {
            console.error('Error handling subscription expiry:', error);
            throw new Error('Failed to handle subscription expiry');
        }
    }

    /**
     * Get subscription history for a doctor
     */
    async getSubscriptionHistory(doctorId: string): Promise<Subscription[]> {
        try {
            const subscriptions = await prisma.subscription.findMany({
                where: { doctor_id: doctorId },
                orderBy: { createdAt: 'desc' },
                include: {
                    payment_transactions: {
                        where: { status: 'SUCCESS' },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });

            return subscriptions;
        } catch (error) {
            console.error('Error fetching subscription history:', error);
            throw new Error('Failed to fetch subscription history');
        }
    }

    /**
     * Check if doctor has access to premium features
     */
    async hasFeatureAccess(doctorId: string, feature: string): Promise<boolean | any> {
        try {
            const status = await this.checkSubscriptionStatus(doctorId);

            // Allow access if subscription is active or in grace period
            return status.isActive ||
                status.status === 'GRACE_PERIOD' ||
                (status.status === 'CANCELLED' && status.expiresAt && new Date() < status.expiresAt);
        } catch (error) {
            console.error('Error checking feature access:', error);
            return false; // Deny access on error
        }
    }

    /**
     * Get doctors with expiring subscriptions (for reminder notifications)
     */
    async getDoctorsWithExpiringSubscriptions(daysAhead: number = 7): Promise<Doctor[]> {
        try {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + daysAhead);

            const doctors = await prisma.doctor.findMany({
                where: {
                    subscription_status: 'ACTIVE',
                    subscription_end: {
                        lte: futureDate,
                        gte: new Date()
                    }
                },
                include: {
                    subscriptions: {
                        where: { status: 'ACTIVE' },
                        take: 1
                    }
                }
            });

            return doctors;
        } catch (error) {
            console.error('Error fetching doctors with expiring subscriptions:', error);
            throw new Error('Failed to fetch expiring subscriptions');
        }
    }
}

// Export singleton instance
export const subscriptionService = SubscriptionService.getInstance();