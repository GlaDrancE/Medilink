import { verifyWebhookSignature, getRazorpayConfig } from '../config/razorpay.config';
import { paymentService } from './payment.service';
import { subscriptionService } from './subscription.service';
import { razorpayClient } from '../utils/razorpay.client';
import { RAZORPAY_CONSTANTS } from '../constants/razorpay.constants';
import prisma from '@repo/db';
import type { 
  RazorpayWebhookPayload, 
  RazorpayWebhookEvent,
  RazorpayPayment,
  RazorpayOrder
} from '../types/razorpay.types';
import type { SubscriptionPlan } from '@repo/db';

/**
 * Webhook service for handling Razorpay payment notifications
 */
export class WebhookService {
  private static instance: WebhookService;
  private config = getRazorpayConfig();

  private constructor() {}

  public static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  /**
   * Process incoming webhook from Razorpay
   */
  async processWebhook(
    payload: string,
    signature: string,
    headers: Record<string, string>
  ): Promise<{
    success: boolean;
    message: string;
    processed?: boolean;
  }> {
    try {
      // Verify webhook signature
      if (this.config.webhookSecret) {
        const isValidSignature = verifyWebhookSignature(
          payload,
          signature,
          this.config.webhookSecret
        );

        if (!isValidSignature) {
          console.error('Invalid webhook signature received');
          return {
            success: false,
            message: 'Invalid webhook signature'
          };
        }
      } else {
        console.warn('Webhook signature verification skipped - no secret configured');
      }

      // Parse webhook payload
      const webhookData: RazorpayWebhookPayload = JSON.parse(payload);
      
      console.log(`Processing webhook event: ${webhookData.event}`);

      // Process based on event type
      const result = await this.handleWebhookEvent(webhookData);

      return {
        success: true,
        message: 'Webhook processed successfully',
        processed: result.processed
      };
    } catch (error) {
      console.error('Error processing webhook:', error);
      return {
        success: false,
        message: 'Failed to process webhook'
      };
    }
  }

  /**
   * Handle specific webhook events
   */
  private async handleWebhookEvent(webhookData: RazorpayWebhookPayload): Promise<{
    processed: boolean;
    message: string;
  }> {
    const { event, payload } = webhookData;

    switch (event as RazorpayWebhookEvent) {
      case RAZORPAY_CONSTANTS.WEBHOOK_EVENTS.PAYMENT_AUTHORIZED:
        return await this.handlePaymentAuthorized(payload.payment?.entity);

      case RAZORPAY_CONSTANTS.WEBHOOK_EVENTS.PAYMENT_CAPTURED:
        return await this.handlePaymentCaptured(payload.payment?.entity);

      case RAZORPAY_CONSTANTS.WEBHOOK_EVENTS.PAYMENT_FAILED:
        return await this.handlePaymentFailed(payload.payment?.entity);

      case RAZORPAY_CONSTANTS.WEBHOOK_EVENTS.ORDER_PAID:
        return await this.handleOrderPaid(payload.order?.entity);

      case RAZORPAY_CONSTANTS.WEBHOOK_EVENTS.REFUND_CREATED:
      case RAZORPAY_CONSTANTS.WEBHOOK_EVENTS.REFUND_PROCESSED:
        return await this.handleRefundEvent(payload.payment?.entity);

      default:
        console.log(`Unhandled webhook event: ${event}`);
        return {
          processed: false,
          message: `Event ${event} not handled`
        };
    }
  }

  /**
   * Handle payment authorized event
   */
  private async handlePaymentAuthorized(payment?: RazorpayPayment): Promise<{
    processed: boolean;
    message: string;
  }> {
    if (!payment) {
      return { processed: false, message: 'No payment data in webhook' };
    }

    try {
      console.log(`Payment authorized: ${payment.id}`);

      // Update payment status to authorized
      await prisma.paymentTransaction.updateMany({
        where: { razorpay_payment_id: payment.id },
        data: {
          status: 'SUCCESS', // We treat authorized as success for subscriptions
          payment_method: payment.method
        }
      });

      // For subscription payments, we might want to activate immediately
      // or wait for capture depending on business logic
      const shouldActivateOnAuthorize = true; // Configure based on requirements

      if (shouldActivateOnAuthorize) {
        await this.activateSubscriptionFromPayment(payment);
      }

      return {
        processed: true,
        message: `Payment ${payment.id} authorized and processed`
      };
    } catch (error) {
      console.error('Error handling payment authorized:', error);
      return {
        processed: false,
        message: `Failed to process authorized payment: ${(error as Error).message}`
      };
    }
  }

  /**
   * Handle payment captured event
   */
  private async handlePaymentCaptured(payment?: RazorpayPayment): Promise<{
    processed: boolean;
    message: string;
  }> {
    if (!payment) {
      return { processed: false, message: 'No payment data in webhook' };
    }

    try {
      console.log(`Payment captured: ${payment.id}`);

      // Update payment status
      await prisma.paymentTransaction.updateMany({
        where: { razorpay_payment_id: payment.id },
        data: {
          status: 'SUCCESS',
          payment_method: payment.method
        }
      });

      // Activate subscription
      await this.activateSubscriptionFromPayment(payment);

      return {
        processed: true,
        message: `Payment ${payment.id} captured and subscription activated`
      };
    } catch (error) {
      console.error('Error handling payment captured:', error);
      return {
        processed: false,
        message: `Failed to process captured payment: ${(error as Error).message}`
      };
    }
  }

  /**
   * Handle payment failed event
   */
  private async handlePaymentFailed(payment?: RazorpayPayment): Promise<{
    processed: boolean;
    message: string;
  }> {
    if (!payment) {
      return { processed: false, message: 'No payment data in webhook' };
    }

    try {
      console.log(`Payment failed: ${payment.id}`);

      const failureReason = payment.error_description || 
                           payment.error_reason || 
                           'Payment failed';

      // Update payment status
      await prisma.paymentTransaction.updateMany({
        where: { razorpay_payment_id: payment.id },
        data: {
          status: 'FAILED',
          failure_reason: failureReason,
          payment_method: payment.method
        }
      });

      // Send failure notification (implement as needed)
      await this.sendPaymentFailureNotification(payment, failureReason);

      return {
        processed: true,
        message: `Payment ${payment.id} marked as failed`
      };
    } catch (error) {
      console.error('Error handling payment failed:', error);
      return {
        processed: false,
        message: `Failed to process failed payment: ${(error as Error).message}`
      };
    }
  }

  /**
   * Handle order paid event
   */
  private async handleOrderPaid(order?: RazorpayOrder): Promise<{
    processed: boolean;
    message: string;
  }> {
    if (!order) {
      return { processed: false, message: 'No order data in webhook' };
    }

    try {
      console.log(`Order paid: ${order.id}`);

      // Get all payments for this order
      const payments = await razorpayClient.fetchOrderPayments(order.id);
      
      // Process each successful payment
      for (const payment of payments) {
        if (payment.status === 'captured' || payment.status === 'authorized') {
          await this.activateSubscriptionFromPayment(payment);
        }
      }

      return {
        processed: true,
        message: `Order ${order.id} processed successfully`
      };
    } catch (error) {
      console.error('Error handling order paid:', error);
      return {
        processed: false,
        message: `Failed to process paid order: ${(error as Error).message}`
      };
    }
  }

  /**
   * Handle refund events
   */
  private async handleRefundEvent(payment?: RazorpayPayment): Promise<{
    processed: boolean;
    message: string;
  }> {
    if (!payment) {
      return { processed: false, message: 'No payment data in webhook' };
    }

    try {
      console.log(`Refund processed for payment: ${payment.id}`);

      // Update payment status
      await prisma.paymentTransaction.updateMany({
        where: { razorpay_payment_id: payment.id },
        data: { status: 'REFUNDED' }
      });

      // Handle subscription cancellation if needed
      await this.handleRefundSubscriptionLogic(payment);

      return {
        processed: true,
        message: `Refund processed for payment ${payment.id}`
      };
    } catch (error) {
      console.error('Error handling refund:', error);
      return {
        processed: false,
        message: `Failed to process refund: ${(error as Error).message}`
      };
    }
  }

  /**
   * Activate subscription from successful payment
   */
  private async activateSubscriptionFromPayment(payment: RazorpayPayment): Promise<void> {
    try {
      // Get order details to extract subscription info
      const order = await razorpayClient.fetchOrder(payment.order_id);
      const doctorId = order.notes?.doctor_id;
      const subscriptionPlan = order.notes?.subscription_plan as SubscriptionPlan;

      if (!doctorId || !subscriptionPlan) {
        console.error('Missing doctor ID or subscription plan in order notes');
        return;
      }

      // Check if subscription already exists for this payment
      const existingTransaction = await prisma.paymentTransaction.findFirst({
        where: { 
          razorpay_payment_id: payment.id,
          subscription_id: { not: null }
        },
        include: { subscription: true }
      });

      if (existingTransaction?.subscription) {
        console.log(`Subscription already exists for payment ${payment.id}`);
        return;
      }

      // Create or update subscription
      await prisma.$transaction(async (tx) => {
        // Update payment transaction
        const paymentTransaction = await tx.paymentTransaction.updateMany({
          where: { razorpay_payment_id: payment.id },
          data: {
            status: 'SUCCESS',
            payment_method: payment.method,
            razorpay_order_id: payment.order_id
          }
        });

        // Create subscription
        const subscription = await subscriptionService.createSubscription(
          doctorId,
          subscriptionPlan
        );

        // Link payment to subscription
        await tx.paymentTransaction.updateMany({
          where: { razorpay_payment_id: payment.id },
          data: { subscription_id: subscription.id }
        });

        console.log(`Subscription ${subscription.id} activated for doctor ${doctorId}`);
      });

      // Send success notification
      await this.sendSubscriptionActivationNotification(doctorId, subscriptionPlan);
    } catch (error) {
      console.error('Error activating subscription from payment:', error);
      throw error;
    }
  }

  /**
   * Handle subscription logic for refunds
   */
  private async handleRefundSubscriptionLogic(payment: RazorpayPayment): Promise<void> {
    try {
      // Find the subscription associated with this payment
      const paymentTransaction = await prisma.paymentTransaction.findFirst({
        where: { razorpay_payment_id: payment.id },
        include: { 
          subscription: true,
          doctor: { select: { id: true, name: true, email: true } }
        }
      });

      if (paymentTransaction?.subscription && paymentTransaction.doctor) {
        // Cancel the subscription
        await subscriptionService.cancelSubscription(paymentTransaction.doctor.id);
        
        console.log(`Subscription cancelled due to refund for doctor ${paymentTransaction.doctor.id}`);
        
        // Send cancellation notification
        await this.sendSubscriptionCancellationNotification(
          paymentTransaction.doctor.id,
          'refund'
        );
      }
    } catch (error) {
      console.error('Error handling refund subscription logic:', error);
    }
  }

  /**
   * Send payment failure notification
   */
  private async sendPaymentFailureNotification(
    payment: RazorpayPayment,
    reason: string
  ): Promise<void> {
    try {
      // Get doctor information from order
      const order = await razorpayClient.fetchOrder(payment.order_id);
      const doctorId = order.notes?.doctor_id;

      if (doctorId) {
        const doctor = await prisma.doctor.findUnique({
          where: { id: doctorId },
          select: { name: true, email: true }
        });

        if (doctor) {
          console.log(`Sending payment failure notification to ${doctor.email}`);
          // TODO: Implement actual notification sending (email/SMS)
          // This could integrate with your existing notification system
        }
      }
    } catch (error) {
      console.error('Error sending payment failure notification:', error);
    }
  }

  /**
   * Send subscription activation notification
   */
  private async sendSubscriptionActivationNotification(
    doctorId: string,
    plan: SubscriptionPlan
  ): Promise<void> {
    try {
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { name: true, email: true }
      });

      if (doctor) {
        console.log(`Sending subscription activation notification to ${doctor.email}`);
        // TODO: Implement actual notification sending
        // Could include welcome email, feature guide, etc.
      }
    } catch (error) {
      console.error('Error sending subscription activation notification:', error);
    }
  }

  /**
   * Send subscription cancellation notification
   */
  private async sendSubscriptionCancellationNotification(
    doctorId: string,
    reason: string
  ): Promise<void> {
    try {
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { name: true, email: true }
      });

      if (doctor) {
        console.log(`Sending subscription cancellation notification to ${doctor.email}`);
        // TODO: Implement actual notification sending
      }
    } catch (error) {
      console.error('Error sending subscription cancellation notification:', error);
    }
  }

  /**
   * Get webhook processing statistics
   */
  async getWebhookStatistics(): Promise<{
    totalProcessed: number;
    successfulPayments: number;
    failedPayments: number;
    refunds: number;
    lastProcessedAt?: Date;
  }> {
    try {
      // This would typically be stored in a separate webhook_logs table
      // For now, we'll derive stats from payment transactions
      const stats = await prisma.paymentTransaction.groupBy({
        by: ['status'],
        _count: { status: true },
        orderBy: { status: 'asc' }
      });

      const totalProcessed = stats.reduce((sum, stat) => sum + stat._count.status, 0);
      const successfulPayments = stats.find(s => s.status === 'SUCCESS')?._count.status || 0;
      const failedPayments = stats.find(s => s.status === 'FAILED')?._count.status || 0;
      const refunds = stats.find(s => s.status === 'REFUNDED')?._count.status || 0;

      const lastTransaction = await prisma.paymentTransaction.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      });

      return {
        totalProcessed,
        successfulPayments,
        failedPayments,
        refunds,
        lastProcessedAt: lastTransaction?.updatedAt
      };
    } catch (error) {
      console.error('Error getting webhook statistics:', error);
      throw new Error('Failed to get webhook statistics');
    }
  }

  /**
   * Retry failed webhook processing
   */
  async retryFailedWebhooks(): Promise<{
    processed: number;
    failed: number;
  }> {
    try {
      // Get pending payments that might need retry
      const pendingPayments = await paymentService.getPendingPayments(60); // 1 hour old
      
      let processed = 0;
      let failed = 0;

      for (const payment of pendingPayments) {
        try {
          // Try to fetch payment details from Razorpay and process
          const razorpayPayment = await razorpayClient.fetchPayment(payment.razorpay_payment_id);
          
          if (razorpayPayment.status === 'captured' || razorpayPayment.status === 'authorized') {
            await this.activateSubscriptionFromPayment(razorpayPayment);
            processed++;
          } else if (razorpayPayment.status === 'failed') {
            await paymentService.handlePaymentFailure(
              payment.razorpay_payment_id,
              'Payment failed - updated via retry'
            );
            processed++;
          }
        } catch (error) {
          console.error(`Failed to retry payment ${payment.razorpay_payment_id}:`, error);
          failed++;
        }
      }

      return { processed, failed };
    } catch (error) {
      console.error('Error retrying failed webhooks:', error);
      throw new Error('Failed to retry webhooks');
    }
  }
}

// Export singleton instance
export const webhookService = WebhookService.getInstance();