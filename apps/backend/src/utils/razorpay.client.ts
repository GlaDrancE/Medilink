import { razorpayInstance, getRazorpayConfig, CreateOrderOptions } from '../config/razorpay.config';
import type { Orders, Payments } from 'razorpay/dist/types/api';

/**
 * Razorpay client wrapper for common operations
 */
export class RazorpayClient {
  private static instance: RazorpayClient;
  private razorpay = razorpayInstance;
  private config = getRazorpayConfig();

  private constructor() {}

  public static getInstance(): RazorpayClient {
    if (!RazorpayClient.instance) {
      RazorpayClient.instance = new RazorpayClient();
    }
    return RazorpayClient.instance;
  }

  /**
   * Create a new order for payment
   */
  async createOrder(options: CreateOrderOptions): Promise<Orders.RazorpayOrder> {
    try {
      const orderOptions = {
        amount: options.amount,
        currency: options.currency || 'INR',
        receipt: options.receipt,
        notes: options.notes || {}
      };

      const order = await this.razorpay.orders.create(orderOptions);
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Fetch order details by ID
   */
  async fetchOrder(orderId: string): Promise<Orders.RazorpayOrder> {
    try {
      const order = await this.razorpay.orders.fetch(orderId);
      return order;
    } catch (error) {
      console.error('Error fetching Razorpay order:', error);
      throw new Error('Failed to fetch order details');
    }
  }

  /**
   * Fetch payment details by ID
   */
  async fetchPayment(paymentId: string): Promise<Payments.RazorpayPayment> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Error fetching Razorpay payment:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  /**
   * Fetch all payments for an order
   */
  async fetchOrderPayments(orderId: string): Promise<Payments.RazorpayPayment[]> {
    try {
      const payments = await this.razorpay.orders.fetchPayments(orderId);
      return payments.items || [];
    } catch (error) {
      console.error('Error fetching order payments:', error);
      throw new Error('Failed to fetch order payments');
    }
  }

  /**
   * Create a refund for a payment
   */
  async createRefund(paymentId: string, amount?: number): Promise<any> {
    try {
      const refundOptions: any = { payment_id: paymentId };
      if (amount) {
        refundOptions.amount = amount;
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundOptions);
      return refund;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new Error('Failed to create refund');
    }
  }

  /**
   * Get Razorpay configuration
   */
  getConfig() {
    return {
      keyId: this.config.keyId,
      // Don't expose secret in logs
      hasSecret: !!this.config.keySecret,
      hasWebhookSecret: !!this.config.webhookSecret
    };
  }

  /**
   * Test Razorpay connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to create a minimal test order
      const testOrder = await this.createOrder({
        amount: 100, // ₹1 in paise
        receipt: `test_${Date.now()}`,
        notes: { test: 'connection_test' }
      });

      return !!testOrder.id;
    } catch (error) {
      console.error('Razorpay connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const razorpayClient = RazorpayClient.getInstance();