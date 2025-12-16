import { RequestHandler, Router } from 'express';
import {
    createPaymentOrder,
    verifyPayment,
    // getPaymentHistory,
    getPaymentStatistics,
    handlePaymentFailure,
    processRefund
} from '../controller/payment.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router: Router = Router();

// All payment routes require authentication
router.use(authMiddleware as RequestHandler);

/**
 * POST /api/v1/payment/create-order
 * Create Razorpay order for subscription payment
 * Body: { 
 *   plan: 'MONTHLY' | 'YEARLY',
 *   customerInfo: { name: string, email: string, phone?: string }
 * }
 */
router.post('/payment/create-order', createPaymentOrder);

/**
 * POST /api/v1/payment/verify
 * Verify payment signature and process successful payment
 * Body: {
 *   razorpay_order_id: string,
 *   razorpay_payment_id: string,
 *   razorpay_signature: string
 * }
 */
router.post('/payment/verify', verifyPayment);

/**
 * GET /api/v1/payment/history
 * Get payment history for authenticated doctor
 */
// router.get('/payment/history', getPaymentHistory);

/**
 * GET /api/v1/payment/statistics
 * Get payment statistics for authenticated doctor
 */
router.get('/payment/statistics', getPaymentStatistics);

/**
 * POST /api/v1/payment/failure
 * Handle payment failure notification
 * Body: { paymentId: string, reason?: string }
 */
router.post('/payment/failure', handlePaymentFailure);

/**
 * POST /api/v1/payment/refund
 * Process refund request
 * Body: { paymentId: string, amount?: number }
 */
router.post('/payment/refund', processRefund);

export default router;