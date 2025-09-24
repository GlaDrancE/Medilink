import { Router } from 'express';
import { 
  handleRazorpayWebhook,
  getWebhookStatistics,
  retryFailedWebhooks,
  webhookHealthCheck
} from '../controller/webhook.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router: Router = Router();

/**
 * POST /api/v1/webhook/razorpay
 * Handle Razorpay webhook notifications
 * No authentication required - Razorpay sends these directly
 */
router.post('/webhook/razorpay', handleRazorpayWebhook);

/**
 * GET /api/v1/webhook/health
 * Health check for webhook endpoint
 * No authentication required - for monitoring
 */
router.get('/webhook/health', webhookHealthCheck);

/**
 * Admin endpoints - require authentication
 */

/**
 * GET /api/v1/webhook/statistics
 * Get webhook processing statistics
 * Requires authentication
 */
router.get('/webhook/statistics', authMiddleware, getWebhookStatistics);

/**
 * POST /api/v1/webhook/retry
 * Retry failed webhook processing
 * Requires authentication
 */
router.post('/webhook/retry', authMiddleware, retryFailedWebhooks);

export default router;