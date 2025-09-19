import { Router } from 'express';
import { notificationController } from '../controller/notification.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /api/notifications/dashboard
 * @desc Get dashboard notifications for authenticated doctor
 * @access Private
 */
router.get('/dashboard', notificationController.getDashboardNotifications.bind(notificationController));

/**
 * @route GET /api/notifications/preferences
 * @desc Get notification preferences for authenticated doctor
 * @access Private
 */
router.get('/preferences', notificationController.getNotificationPreferences.bind(notificationController));

/**
 * @route PUT /api/notifications/preferences
 * @desc Update notification preferences for authenticated doctor
 * @access Private
 */
router.put('/preferences', notificationController.updateNotificationPreferences.bind(notificationController));

// Admin routes (in a real implementation, you would add admin middleware)
/**
 * @route GET /api/notifications/admin/expiring
 * @desc Get expiring subscriptions
 * @access Admin
 */
router.get('/admin/expiring', notificationController.getExpiringSubscriptions.bind(notificationController));

/**
 * @route GET /api/notifications/admin/grace-period
 * @desc Get grace period subscriptions
 * @access Admin
 */
router.get('/admin/grace-period', notificationController.getGracePeriodSubscriptions.bind(notificationController));

/**
 * @route POST /api/notifications/admin/trigger-reminders
 * @desc Manually trigger expiry reminders
 * @access Admin
 */
router.post('/admin/trigger-reminders', notificationController.triggerExpiryReminders.bind(notificationController));

/**
 * @route POST /api/notifications/admin/test
 * @desc Send test notification
 * @access Admin
 */
router.post('/admin/test', notificationController.sendTestNotification.bind(notificationController));

export default router;