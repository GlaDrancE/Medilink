import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { expiryReminderJob } from '../jobs/expiry-reminder.job';

export class NotificationController {
  /**
   * Get dashboard notifications for the authenticated doctor
   */
  async getDashboardNotifications(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.user?.id;
      
      if (!doctorId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const notifications = await notificationService.getDashboardNotifications(doctorId);

      res.json({
        success: true,
        data: {
          notifications,
          count: notifications.length
        }
      });
    } catch (error) {
      console.error('Error getting dashboard notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get notifications'
      });
    }
  }

  /**
   * Get notification preferences for the authenticated doctor
   */
  async getNotificationPreferences(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.user?.id;
      
      if (!doctorId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const preferences = await notificationService.getNotificationPreferences(doctorId);

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get notification preferences'
      });
    }
  }

  /**
   * Update notification preferences for the authenticated doctor
   */
  async updateNotificationPreferences(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.user?.id;
      
      if (!doctorId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const preferences = req.body;

      // Validate preferences
      const validKeys = [
        'emailNotifications',
        'smsNotifications', 
        'expiryReminders',
        'paymentReceipts',
        'featureUpdates'
      ];

      const invalidKeys = Object.keys(preferences).filter(key => !validKeys.includes(key));
      if (invalidKeys.length > 0) {
        res.status(400).json({
          success: false,
          error: `Invalid preference keys: ${invalidKeys.join(', ')}`
        });
        return;
      }

      const success = await notificationService.updateNotificationPreferences(doctorId, preferences);

      if (success) {
        res.json({
          success: true,
          message: 'Notification preferences updated successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to update notification preferences'
        });
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update notification preferences'
      });
    }
  }

  /**
   * Get expiring subscriptions (admin only)
   */
  async getExpiringSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      // In a real implementation, you would check for admin role
      const daysAhead = parseInt(req.query.days as string) || 7;

      const expiringSubscriptions = await notificationService.getDoctorsWithExpiringSubscriptions(daysAhead);

      res.json({
        success: true,
        data: {
          subscriptions: expiringSubscriptions,
          count: expiringSubscriptions.length,
          daysAhead
        }
      });
    } catch (error) {
      console.error('Error getting expiring subscriptions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get expiring subscriptions'
      });
    }
  }

  /**
   * Get grace period subscriptions (admin only)
   */
  async getGracePeriodSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      // In a real implementation, you would check for admin role
      const gracePeriodSubscriptions = await notificationService.getDoctorsInGracePeriod();

      res.json({
        success: true,
        data: {
          subscriptions: gracePeriodSubscriptions,
          count: gracePeriodSubscriptions.length
        }
      });
    } catch (error) {
      console.error('Error getting grace period subscriptions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get grace period subscriptions'
      });
    }
  }

  /**
   * Manually trigger expiry reminders (admin only)
   */
  async triggerExpiryReminders(req: Request, res: Response): Promise<void> {
    try {
      // In a real implementation, you would check for admin role
      
      if (expiryReminderJob.isJobRunning()) {
        res.status(409).json({
          success: false,
          error: 'Expiry reminder job is already running'
        });
        return;
      }

      const result = await expiryReminderJob.runManually();

      res.json({
        success: true,
        data: result,
        message: 'Expiry reminders triggered successfully'
      });
    } catch (error) {
      console.error('Error triggering expiry reminders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to trigger expiry reminders'
      });
    }
  }

  /**
   * Send test notification (admin only)
   */
  async sendTestNotification(req: Request, res: Response): Promise<void> {
    try {
      // In a real implementation, you would check for admin role
      const { doctorId, type = 'EMAIL', daysUntilExpiry = 7 } = req.body;

      if (!doctorId) {
        res.status(400).json({
          success: false,
          error: 'Doctor ID is required'
        });
        return;
      }

      const success = await notificationService.sendExpiryWarning(
        doctorId,
        'test-subscription-id',
        daysUntilExpiry,
        type
      );

      if (success) {
        res.json({
          success: true,
          message: 'Test notification sent successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to send test notification'
        });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send test notification'
      });
    }
  }
}

export const notificationController = new NotificationController();