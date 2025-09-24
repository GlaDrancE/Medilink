import { RequestHandler, Router } from 'express';
import { 
  getSubscriptionStatus,
  createSubscription,
  upgradeSubscription,
  cancelSubscription,
  getSubscriptionHistory,
  checkFeatureAccess
} from '../controller/subscription.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router: Router = Router();

// All subscription routes require authentication
router.use(authMiddleware as RequestHandler);

/**
 * GET /api/v1/subscription/status
 * Get current subscription status for authenticated doctor
 */
router.get('/subscription/status', getSubscriptionStatus);

/**
 * POST /api/v1/subscription/create
 * Create new subscription for authenticated doctor
 * Body: { plan: 'MONTHLY' | 'YEARLY' }
 */
router.post('/subscription/create', createSubscription);

/**
 * POST /api/v1/subscription/upgrade
 * Upgrade subscription plan for authenticated doctor
 * Body: { newPlan: 'MONTHLY' | 'YEARLY' }
 */
router.post('/subscription/upgrade', upgradeSubscription);

/**
 * POST /api/v1/subscription/cancel
 * Cancel subscription for authenticated doctor
 */
router.post('/subscription/cancel', cancelSubscription);

/**
 * GET /api/v1/subscription/history
 * Get subscription history for authenticated doctor
 */
router.get('/subscription/history', getSubscriptionHistory);

/**
 * GET /api/v1/subscription/feature/:feature
 * Check feature access for authenticated doctor
 * Params: { feature: string }
 */
router.get('/subscription/feature/:feature', checkFeatureAccess);

export default router;