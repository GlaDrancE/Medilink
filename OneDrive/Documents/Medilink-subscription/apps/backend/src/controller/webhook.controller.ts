import { Request, Response } from 'express';
import { webhookService } from '../services/webhook.service';
import { 
  createPaymentError,
  createErrorResponse,
  logPaymentError,
  PAYMENT_ERROR_CODES
} from '../utils/payment-error.handler';

/**
 * Handle Razorpay webhook notifications
 */
export const handleRazorpayWebhook = async (req: Request, res: Response) => {
  try {
    // Get webhook signature from headers
    const signature = req.headers['x-razorpay-signature'] as string;
    
    if (!signature) {
      console.error('Missing webhook signature');
      const error = createPaymentError(
        PAYMENT_ERROR_CODES.SIGNATURE_VERIFICATION_FAILED,
        'Missing webhook signature'
      );
      return res.status(error.httpStatus).json(createErrorResponse(error));
    }

    // Get raw body as string
    const payload = JSON.stringify(req.body);
    
    // Process webhook
    const result = await webhookService.processWebhook(
      payload,
      signature,
      req.headers as Record<string, string>
    );

    if (result.success) {
      console.log('Webhook processed successfully:', result.message);
      res.status(200).json({
        success: true,
        message: result.message,
        processed: result.processed
      });
    } else {
      console.error('Webhook processing failed:', result.message);
      const error = createPaymentError(
        PAYMENT_ERROR_CODES.SIGNATURE_VERIFICATION_FAILED,
        result.message
      );
      logPaymentError(error, { signature, payload: req.body });
      res.status(error.httpStatus).json(createErrorResponse(error));
    }
  } catch (error) {
    console.error('Error in webhook handler:', error);
    const paymentError = createPaymentError(
      PAYMENT_ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      (error as Error).message,
      'Webhook processing failed'
    );
    logPaymentError(paymentError, { body: req.body, headers: req.headers });
    res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
  }
};

/**
 * Get webhook processing statistics (admin endpoint)
 */
export const getWebhookStatistics = async (req: Request, res: Response) => {
  try {
    const stats = await webhookService.getWebhookStatistics();

    res.status(200).json({
      success: true,
      data: {
        totalProcessed: stats.totalProcessed,
        successfulPayments: stats.successfulPayments,
        failedPayments: stats.failedPayments,
        refunds: stats.refunds,
        lastProcessedAt: stats.lastProcessedAt,
        successRate: stats.totalProcessed > 0 ? 
          Math.round((stats.successfulPayments / stats.totalProcessed) * 100 * 100) / 100 : 0
      }
    });
  } catch (error) {
    console.error('Error getting webhook statistics:', error);
    const paymentError = createPaymentError(
      PAYMENT_ERROR_CODES.DATABASE_ERROR,
      (error as Error).message,
      'Unable to fetch webhook statistics'
    );
    res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
  }
};

/**
 * Retry failed webhook processing (admin endpoint)
 */
export const retryFailedWebhooks = async (req: Request, res: Response) => {
  try {
    const result = await webhookService.retryFailedWebhooks();

    res.status(200).json({
      success: true,
      data: {
        processed: result.processed,
        failed: result.failed,
        message: `Retry completed: ${result.processed} processed, ${result.failed} failed`
      }
    });
  } catch (error) {
    console.error('Error retrying failed webhooks:', error);
    const paymentError = createPaymentError(
      PAYMENT_ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      (error as Error).message,
      'Unable to retry failed webhooks'
    );
    res.status(paymentError.httpStatus).json(createErrorResponse(paymentError));
  }
};

/**
 * Health check for webhook endpoint
 */
export const webhookHealthCheck = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Webhook endpoint is healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Error in webhook health check:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook endpoint health check failed'
    });
  }
};