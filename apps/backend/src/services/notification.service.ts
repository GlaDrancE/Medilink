import { PrismaClient } from '@prisma/client';
import { SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  expiryReminders: boolean;
  paymentReceipts: boolean;
  featureUpdates: boolean;
}

export interface ExpiryNotification {
  doctorId: string;
  subscriptionId: string;
  daysUntilExpiry: number;
  notificationType: 'EMAIL' | 'SMS' | 'DASHBOARD';
  message: string;
  sentAt: Date;
}

export class NotificationService {
  /**
   * Get doctors with subscriptions expiring within specified days
   */
  async getDoctorsWithExpiringSubscriptions(daysAhead: number = 7): Promise<any[]> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);

    try {
      const expiringSubscriptions = await prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          endDate: {
            lte: targetDate,
            gte: new Date() // Only future dates
          }
        },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
              // Add phone field if available in your schema
            }
          }
        }
      });

      return expiringSubscriptions.map(sub => ({
        doctorId: sub.doctorId,
        subscriptionId: sub.id,
        doctorName: sub.doctor.name,
        doctorEmail: sub.doctor.email,
        plan: sub.plan,
        endDate: sub.endDate,
        daysUntilExpiry: Math.ceil((sub.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }));
    } catch (error) {
      console.error('Error fetching expiring subscriptions:', error);
      throw new Error('Failed to fetch expiring subscriptions');
    }
  }

  /**
   * Get doctors with expired subscriptions in grace period
   */
  async getDoctorsInGracePeriod(): Promise<any[]> {
    const gracePeriodStart = new Date();
    gracePeriodStart.setDate(gracePeriodStart.getDate() - 7); // 7 days grace period

    try {
      const expiredSubscriptions = await prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.EXPIRED,
          endDate: {
            gte: gracePeriodStart,
            lt: new Date()
          }
        },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      return expiredSubscriptions.map(sub => ({
        doctorId: sub.doctorId,
        subscriptionId: sub.id,
        doctorName: sub.doctor.name,
        doctorEmail: sub.doctor.email,
        plan: sub.plan,
        endDate: sub.endDate,
        daysExpired: Math.ceil((new Date().getTime() - sub.endDate.getTime()) / (1000 * 60 * 60 * 24))
      }));
    } catch (error) {
      console.error('Error fetching grace period subscriptions:', error);
      throw new Error('Failed to fetch grace period subscriptions');
    }
  }

  /**
   * Send expiry warning notification
   */
  async sendExpiryWarning(
    doctorId: string, 
    subscriptionId: string, 
    daysUntilExpiry: number,
    notificationType: 'EMAIL' | 'SMS' = 'EMAIL'
  ): Promise<boolean> {
    try {
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { name: true, email: true }
      });

      if (!doctor) {
        throw new Error('Doctor not found');
      }

      const message = this.generateExpiryMessage(doctor.name, daysUntilExpiry);

      // In a real implementation, you would integrate with email/SMS services
      // For now, we'll log the notification and store it in database
      console.log(`Sending ${notificationType} notification to ${doctor.email}:`, message);

      // Store notification record (you might want to create a notifications table)
      await this.logNotification({
        doctorId,
        subscriptionId,
        daysUntilExpiry,
        notificationType,
        message,
        sentAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error sending expiry warning:', error);
      return false;
    }
  }

  /**
   * Send grace period notification
   */
  async sendGracePeriodNotification(
    doctorId: string, 
    subscriptionId: string, 
    daysExpired: number
  ): Promise<boolean> {
    try {
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { name: true, email: true }
      });

      if (!doctor) {
        throw new Error('Doctor not found');
      }

      const message = this.generateGracePeriodMessage(doctor.name, daysExpired);

      console.log(`Sending grace period notification to ${doctor.email}:`, message);

      await this.logNotification({
        doctorId,
        subscriptionId,
        daysUntilExpiry: -daysExpired, // Negative to indicate expired
        notificationType: 'EMAIL',
        message,
        sentAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error sending grace period notification:', error);
      return false;
    }
  }

  /**
   * Process all expiry reminders
   */
  async processExpiryReminders(): Promise<{
    processed: number;
    successful: number;
    failed: number;
  }> {
    let processed = 0;
    let successful = 0;
    let failed = 0;

    try {
      // Send 7-day warnings
      const expiring7Days = await this.getDoctorsWithExpiringSubscriptions(7);
      for (const subscription of expiring7Days) {
        processed++;
        const success = await this.sendExpiryWarning(
          subscription.doctorId,
          subscription.subscriptionId,
          subscription.daysUntilExpiry
        );
        if (success) successful++;
        else failed++;
      }

      // Send 3-day warnings
      const expiring3Days = await this.getDoctorsWithExpiringSubscriptions(3);
      for (const subscription of expiring3Days) {
        processed++;
        const success = await this.sendExpiryWarning(
          subscription.doctorId,
          subscription.subscriptionId,
          subscription.daysUntilExpiry
        );
        if (success) successful++;
        else failed++;
      }

      // Send 1-day warnings
      const expiring1Day = await this.getDoctorsWithExpiringSubscriptions(1);
      for (const subscription of expiring1Day) {
        processed++;
        const success = await this.sendExpiryWarning(
          subscription.doctorId,
          subscription.subscriptionId,
          subscription.daysUntilExpiry
        );
        if (success) successful++;
        else failed++;
      }

      // Send grace period notifications
      const gracePeriodDoctors = await this.getDoctorsInGracePeriod();
      for (const subscription of gracePeriodDoctors) {
        processed++;
        const success = await this.sendGracePeriodNotification(
          subscription.doctorId,
          subscription.subscriptionId,
          subscription.daysExpired
        );
        if (success) successful++;
        else failed++;
      }

      console.log(`Expiry reminders processed: ${processed}, successful: ${successful}, failed: ${failed}`);
      
      return { processed, successful, failed };
    } catch (error) {
      console.error('Error processing expiry reminders:', error);
      throw error;
    }
  }

  /**
   * Get dashboard notifications for a doctor
   */
  async getDashboardNotifications(doctorId: string): Promise<any[]> {
    try {
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        include: {
          subscriptions: {
            where: {
              OR: [
                { status: SubscriptionStatus.ACTIVE },
                { status: SubscriptionStatus.EXPIRED }
              ]
            },
            orderBy: { endDate: 'desc' },
            take: 1
          }
        }
      });

      if (!doctor || !doctor.subscriptions.length) {
        return [];
      }

      const subscription = doctor.subscriptions[0];
      const notifications = [];

      if (subscription.status === SubscriptionStatus.ACTIVE) {
        const daysUntilExpiry = Math.ceil(
          (subscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          notifications.push({
            id: `expiry-warning-${subscription.id}`,
            type: 'warning',
            title: 'Subscription Expiring Soon',
            message: `Your subscription expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}`,
            actionText: 'Renew Now',
            actionUrl: '/subscription',
            createdAt: new Date()
          });
        }
      } else if (subscription.status === SubscriptionStatus.EXPIRED) {
        const daysExpired = Math.ceil(
          (new Date().getTime() - subscription.endDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysExpired <= 7) {
          notifications.push({
            id: `grace-period-${subscription.id}`,
            type: 'error',
            title: 'Subscription Expired',
            message: `Your subscription expired ${daysExpired} day${daysExpired > 1 ? 's' : ''} ago. You have ${7 - daysExpired} days left in your grace period.`,
            actionText: 'Renew Now',
            actionUrl: '/subscription',
            createdAt: new Date()
          });
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error getting dashboard notifications:', error);
      return [];
    }
  }

  /**
   * Generate expiry warning message
   */
  private generateExpiryMessage(doctorName: string, daysUntilExpiry: number): string {
    return `Dear Dr. ${doctorName},

Your MediLink Premium subscription will expire in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}.

To continue enjoying unlimited patients, digital prescriptions, and automated reminders, please renew your subscription.

Renew now: [Subscription Link]

Best regards,
MediLink Team`;
  }

  /**
   * Generate grace period message
   */
  private generateGracePeriodMessage(doctorName: string, daysExpired: number): string {
    const graceDaysLeft = 7 - daysExpired;
    
    return `Dear Dr. ${doctorName},

Your MediLink Premium subscription expired ${daysExpired} day${daysExpired > 1 ? 's' : ''} ago.

You still have ${graceDaysLeft} day${graceDaysLeft > 1 ? 's' : ''} left in your grace period to renew and maintain access to all premium features.

Renew now: [Subscription Link]

Best regards,
MediLink Team`;
  }

  /**
   * Log notification for audit trail
   */
  private async logNotification(notification: ExpiryNotification): Promise<void> {
    try {
      // In a real implementation, you would store this in a notifications table
      console.log('Notification logged:', notification);
      
      // For now, we can store it as a simple log entry
      // You might want to create a notifications table in your schema
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  /**
   * Get notification preferences for a doctor
   */
  async getNotificationPreferences(doctorId: string): Promise<NotificationPreferences> {
    try {
      // In a real implementation, you would fetch from a user preferences table
      // For now, return default preferences
      return {
        emailNotifications: true,
        smsNotifications: true,
        expiryReminders: true,
        paymentReceipts: true,
        featureUpdates: false
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        emailNotifications: true,
        smsNotifications: false,
        expiryReminders: true,
        paymentReceipts: true,
        featureUpdates: false
      };
    }
  }

  /**
   * Update notification preferences for a doctor
   */
  async updateNotificationPreferences(
    doctorId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      // In a real implementation, you would update the user preferences table
      console.log(`Updating notification preferences for doctor ${doctorId}:`, preferences);
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();