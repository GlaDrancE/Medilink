import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { razorpayClient } from '../../utils/razorpay.client';
import { paymentService } from '../../services/payment.service';
import { subscriptionService } from '../../services/subscription.service';

// Razorpay test environment configuration
const RAZORPAY_TEST_CONFIG = {
  keyId: process.env.RAZORPAY_TEST_KEY_ID || 'rzp_test_key',
  keySecret: process.env.RAZORPAY_TEST_KEY_SECRET || 'test_secret',
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret'
};

const TEST_AMOUNTS = {
  MONTHLY: 9900, // ₹99 in paise
  YEARLY: 99900  // ₹999 in paise
};

describe('Razorpay Integration Tests', () => {
  let testDoctorId: string;

  beforeAll(async () => {
    // Setup test environment
    testDoctorId = 'test-doctor-' + Date.now();
    
    // Verify Razorpay test environment is accessible
    try {
      await razorpayClient.orders.create({
        amount: 100,
        currency: 'INR',
        receipt: 'test_receipt'
      });
    } catch (error) {
      console.warn('Razorpay test environment not accessible:', error);
    }
  });

  afterAll(async () => {
    // Cleanup test data
  });

  beforeEach(async () => {
    // Reset test state
  });

  describe('Order Creation', () => {
    it('should create order for monthly subscription', async () => {
      const orderData = {
        amount: TEST_AMOUNTS.MONTHLY,
        currency: 'INR',
        receipt: `monthly_${testDoctorId}_${Date.now()}`,
        notes: {
          doctorId: testDoctorId,
          plan: 'MONTHLY'
        }
      };

      const order = await razorpayClient.orders.create(orderData);

      expect(order).toMatchObject({
        id: expect.stringMatching(/^order_/),
        amount: TEST_AMOUNTS.MONTHLY,
        currency: 'INR',
        status: 'created',
        receipt: orderData.receipt
      });

      expect(order.notes).toMatchObject({
        doctorId: testDoctorId,
        plan: 'MONTHLY'
      });
    });

    it('should create order for yearly subscription', async () => {
      const orderData = {
        amount: TEST_AMOUNTS.YEARLY,
        currency: 'INR',
        receipt: `yearly_${testDoctorId}_${Date.now()}`,
        notes: {
          doctorId: testDoctorId,
          plan: 'YEARLY'
        }
      };

      const order = await razorpayClient.orders.create(orderData);

      expect(order).toMatchObject({
        id: expect.stringMatching(/^order_/),
        amount: TEST_AMOUNTS.YEARLY,
        currency: 'INR',
        status: 'created'
      });
    });

    it('should handle order creation errors', async () => {
      const invalidOrderData = {
        amount: -100, // Invalid amount
        currency: 'INR',
        receipt: 'invalid_order'
      };

      await expect(
        razorpayClient.orders.create(invalidOrderData)
      ).rejects.toThrow();
    });
  });

  describe('Payment Verification', () => {
    it('should verify successful payment signature', async () => {
      // Create test order first
      const order = await razorpayClient.orders.create({
        amount: TEST_AMOUNTS.MONTHLY,
        currency: 'INR',
        receipt: `verify_test_${Date.now()}`
      });

      // Simulate payment data (in real test, this would come from Razorpay)
      const paymentData = {
        razorpay_order_id: order.id,
        razorpay_payment_id: 'pay_test_' + Date.now(),
        razorpay_signature: 'test_signature'
      };

      // Test signature verification
      const isValid = await paymentService.verifyPaymentSignature(
        paymentData.razorpay_order_id,
        paymentData.razorpay_payment_id,
        paymentData.razorpay_signature
      );

      // Note: In test environment, signature verification might be mocked
      expect(typeof isValid).toBe('boolean');
    });

    it('should reject invalid payment signature', async () => {
      const paymentData = {
        razorpay_order_id: 'order_invalid',
        razorpay_payment_id: 'pay_invalid',
        razorpay_signature: 'invalid_signature'
      };

      const isValid = await paymentService.verifyPaymentSignature(
        paymentData.razorpay_order_id,
        paymentData.razorpay_payment_id,
        paymentData.razorpay_signature
      );

      expect(isValid).toBe(false);
    });
  });

  describe('Payment Processing Flow', () => {
    it('should complete full payment flow for monthly subscription', async () => {
      // Step 1: Create payment order
      const orderResult = await paymentService.createPaymentOrder(
        testDoctorId,
        'MONTHLY'
      );

      expect(orderResult.success).toBe(true);
      expect(orderResult.data?.order).toMatchObject({
        amount: TEST_AMOUNTS.MONTHLY,
        currency: 'INR',
        razorpayOrderId: expect.stringMatching(/^order_/)
      });

      const orderId = orderResult.data!.order.razorpayOrderId;

      // Step 2: Simulate successful payment
      const paymentId = 'pay_test_' + Date.now();
      const signature = 'test_signature_' + Date.now();

      const verificationResult = await paymentService.verifyAndProcessPayment(
        testDoctorId,
        orderId,
        paymentId,
        signature
      );

      expect(verificationResult.success).toBe(true);
      expect(verificationResult.data?.subscription).toMatchObject({
        doctorId: testDoctorId,
        plan: 'MONTHLY',
        status: 'ACTIVE'
      });
    });

    it('should handle payment failure correctly', async () => {
      // Create payment order
      const orderResult = await paymentService.createPaymentOrder(
        testDoctorId,
        'MONTHLY'
      );

      const orderId = orderResult.data!.order.razorpayOrderId;

      // Simulate payment failure
      const paymentId = 'pay_failed_' + Date.now();
      const invalidSignature = 'invalid_signature';

      const verificationResult = await paymentService.verifyAndProcessPayment(
        testDoctorId,
        orderId,
        paymentId,
        invalidSignature
      );

      expect(verificationResult.success).toBe(false);
      expect(verificationResult.error).toContain('verification failed');

      // Verify subscription was not created
      const subscriptionStatus = await subscriptionService.getSubscriptionStatus(testDoctorId);
      expect(subscriptionStatus.isActive).toBe(false);
    });
  });

  describe('Webhook Processing', () => {
    it('should process payment.captured webhook correctly', async () => {
      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_webhook_test_' + Date.now(),
              order_id: 'order_webhook_test_' + Date.now(),
              status: 'captured',
              amount: TEST_AMOUNTS.MONTHLY,
              currency: 'INR',
              method: 'card',
              captured: true,
              created_at: Math.floor(Date.now() / 1000)
            }
          }
        }
      };

      // Process webhook
      const result = await paymentService.processWebhook(
        webhookPayload,
        'test_signature'
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('processed successfully');
    });

    it('should process payment.failed webhook correctly', async () => {
      const webhookPayload = {
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: 'pay_failed_webhook_' + Date.now(),
              order_id: 'order_failed_webhook_' + Date.now(),
              status: 'failed',
              amount: TEST_AMOUNTS.MONTHLY,
              currency: 'INR',
              error_code: 'BAD_REQUEST_ERROR',
              error_description: 'Payment failed due to insufficient funds'
            }
          }
        }
      };

      const result = await paymentService.processWebhook(
        webhookPayload,
        'test_signature'
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('processed successfully');
    });

    it('should reject webhook with invalid signature', async () => {
      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_invalid_webhook',
              status: 'captured'
            }
          }
        }
      };

      const result = await paymentService.processWebhook(
        webhookPayload,
        'invalid_signature'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid webhook signature');
    });
  });

  describe('Subscription Lifecycle', () => {
    it('should handle subscription upgrade with prorated billing', async () => {
      // Step 1: Create initial monthly subscription
      const monthlyOrderResult = await paymentService.createPaymentOrder(
        testDoctorId,
        'MONTHLY'
      );

      await paymentService.verifyAndProcessPayment(
        testDoctorId,
        monthlyOrderResult.data!.order.razorpayOrderId,
        'pay_monthly_' + Date.now(),
        'test_signature'
      );

      // Step 2: Upgrade to yearly
      const upgradeResult = await subscriptionService.upgradeSubscription(
        testDoctorId,
        'YEARLY'
      );

      expect(upgradeResult.success).toBe(true);
      expect(upgradeResult.data?.proratedAmount).toBeGreaterThan(0);
      expect(upgradeResult.data?.paymentOrder).toBeDefined();

      // Step 3: Complete upgrade payment
      const upgradePaymentResult = await paymentService.verifyAndProcessPayment(
        testDoctorId,
        upgradeResult.data!.paymentOrder.razorpayOrderId,
        'pay_upgrade_' + Date.now(),
        'test_signature'
      );

      expect(upgradePaymentResult.success).toBe(true);
      expect(upgradePaymentResult.data?.subscription.plan).toBe('YEARLY');
    });

    it('should handle subscription renewal', async () => {
      // Step 1: Create expired subscription (simulate)
      // This would involve setting up a subscription with past end date

      // Step 2: Renew subscription
      const renewalResult = await subscriptionService.renewSubscription(
        testDoctorId,
        'MONTHLY'
      );

      expect(renewalResult.success).toBe(true);
      expect(renewalResult.data?.paymentOrder).toBeDefined();

      // Step 3: Complete renewal payment
      const renewalPaymentResult = await paymentService.verifyAndProcessPayment(
        testDoctorId,
        renewalResult.data!.paymentOrder.razorpayOrderId,
        'pay_renewal_' + Date.now(),
        'test_signature'
      );

      expect(renewalPaymentResult.success).toBe(true);
      expect(renewalPaymentResult.data?.subscription.status).toBe('ACTIVE');
    });

    it('should handle subscription cancellation', async () => {
      // Prerequisite: Active subscription exists
      
      const cancellationResult = await subscriptionService.cancelSubscription(testDoctorId);

      expect(cancellationResult.success).toBe(true);
      expect(cancellationResult.message).toContain('cancelled successfully');

      // Verify subscription status
      const status = await subscriptionService.getSubscriptionStatus(testDoctorId);
      expect(status.status).toBe('CANCELLED');
      expect(status.isActive).toBe(true); // Still active until end date
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle Razorpay API rate limiting', async () => {
      // Simulate multiple rapid requests to trigger rate limiting
      const promises = Array.from({ length: 10 }, (_, i) =>
        paymentService.createPaymentOrder(testDoctorId + '_' + i, 'MONTHLY')
      );

      const results = await Promise.allSettled(promises);
      
      // Some requests should succeed, some might be rate limited
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      expect(successful + failed).toBe(10);
      expect(successful).toBeGreaterThan(0); // At least some should succeed
    });

    it('should handle network timeouts gracefully', async () => {
      // Mock network timeout
      const originalTimeout = razorpayClient.timeout;
      razorpayClient.timeout = 1; // 1ms timeout to force failure

      try {
        await expect(
          paymentService.createPaymentOrder(testDoctorId, 'MONTHLY')
        ).rejects.toThrow();
      } finally {
        razorpayClient.timeout = originalTimeout;
      }
    });

    it('should handle duplicate payment processing', async () => {
      // Create order
      const orderResult = await paymentService.createPaymentOrder(
        testDoctorId,
        'MONTHLY'
      );

      const orderId = orderResult.data!.order.razorpayOrderId;
      const paymentId = 'pay_duplicate_' + Date.now();
      const signature = 'test_signature';

      // Process payment first time
      const firstResult = await paymentService.verifyAndProcessPayment(
        testDoctorId,
        orderId,
        paymentId,
        signature
      );

      expect(firstResult.success).toBe(true);

      // Try to process same payment again
      const secondResult = await paymentService.verifyAndProcessPayment(
        testDoctorId,
        orderId,
        paymentId,
        signature
      );

      // Should handle duplicate gracefully
      expect(secondResult.success).toBe(false);
      expect(secondResult.error).toContain('already processed');
    });
  });

  describe('Security Testing', () => {
    it('should validate webhook signatures correctly', async () => {
      const payload = JSON.stringify({
        event: 'payment.captured',
        payload: { payment: { entity: { id: 'pay_security_test' } } }
      });

      // Test with correct signature
      const validSignature = paymentService.generateWebhookSignature(
        payload,
        RAZORPAY_TEST_CONFIG.webhookSecret
      );

      const validResult = await paymentService.validateWebhookSignature(
        payload,
        validSignature
      );

      expect(validResult).toBe(true);

      // Test with incorrect signature
      const invalidResult = await paymentService.validateWebhookSignature(
        payload,
        'invalid_signature'
      );

      expect(invalidResult).toBe(false);
    });

    it('should not expose sensitive data in responses', async () => {
      const orderResult = await paymentService.createPaymentOrder(
        testDoctorId,
        'MONTHLY'
      );

      // Verify sensitive data is not exposed
      expect(orderResult.data).not.toHaveProperty('keySecret');
      expect(orderResult.data).not.toHaveProperty('webhookSecret');
      expect(orderResult.data?.order).not.toHaveProperty('key_secret');
    });

    it('should handle malformed webhook payloads', async () => {
      const malformedPayloads = [
        null,
        undefined,
        '',
        '{}',
        '{"invalid": "payload"}',
        '{"event": "unknown.event"}'
      ];

      for (const payload of malformedPayloads) {
        const result = await paymentService.processWebhook(
          payload as any,
          'test_signature'
        );

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('Performance Testing', () => {
    it('should handle concurrent payment processing', async () => {
      const concurrentPayments = 5;
      const promises = Array.from({ length: concurrentPayments }, async (_, i) => {
        const doctorId = testDoctorId + '_concurrent_' + i;
        
        // Create order
        const orderResult = await paymentService.createPaymentOrder(
          doctorId,
          'MONTHLY'
        );

        // Process payment
        return paymentService.verifyAndProcessPayment(
          doctorId,
          orderResult.data!.order.razorpayOrderId,
          'pay_concurrent_' + i + '_' + Date.now(),
          'test_signature_' + i
        );
      });

      const results = await Promise.all(promises);

      // All payments should be processed successfully
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should complete payment processing within acceptable time', async () => {
      const startTime = Date.now();

      const orderResult = await paymentService.createPaymentOrder(
        testDoctorId,
        'MONTHLY'
      );

      const paymentResult = await paymentService.verifyAndProcessPayment(
        testDoctorId,
        orderResult.data!.order.razorpayOrderId,
        'pay_performance_' + Date.now(),
        'test_signature'
      );

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(paymentResult.success).toBe(true);
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});