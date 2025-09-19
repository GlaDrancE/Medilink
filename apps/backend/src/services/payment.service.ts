import { razorpayClient } from "../utils/razorpay.client";
import {
  verifyPaymentSignature,
  getRazorpayConfig,
} from "../config/razorpay.config";
import {
  generateReceiptId,
  createOrderNotes,
  RAZORPAY_CONSTANTS,
} from "../constants/razorpay.constants";
import prisma, { SUBSCRIPTION_PLANS } from "@repo/db";
import type {
  SubscriptionPlan,
  PaymentStatus,
  PaymentTransaction,
} from "@repo/db";
import type {
  CreateSubscriptionOrderRequest,
  SubscriptionOrderResponse,
  PaymentVerificationRequest,
  RazorpayOrder,
  RazorpayPayment,
} from "../types/razorpay.types";

/**
 * Payment service for handling Razorpay payment processing
 */
export class PaymentService {
  private static instance: PaymentService;
  private config = getRazorpayConfig();

  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Create a Razorpay order for subscription payment
   */
  async createSubscriptionOrder(
    request: CreateSubscriptionOrderRequest
  ): Promise<SubscriptionOrderResponse> {
    try {
      const { doctorId, plan, customerInfo } = request;

      // Validate plan
      if (!SUBSCRIPTION_PLANS[plan]) {
        throw new Error("Invalid subscription plan");
      }

      const planConfig = SUBSCRIPTION_PLANS[plan];
      const receiptId = generateReceiptId("SUBSCRIPTION", doctorId);
      const orderNotes = createOrderNotes(doctorId, plan, "subscription");

      // Create Razorpay order
      const razorpayOrder = await razorpayClient.createOrder({
        amount: planConfig.price,
        currency: RAZORPAY_CONSTANTS.DEFAULT_CURRENCY,
        receipt: receiptId,
        notes: {
          ...orderNotes,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone || "",
        },
      });

      // Store payment transaction record
      await this.createPaymentTransaction({
        doctorId,
        razorpayOrderId: razorpayOrder.id,
        amount: planConfig.price,
        currency: RAZORPAY_CONSTANTS.DEFAULT_CURRENCY,
        status: "PENDING",
        subscriptionPlan: plan,
      });

      console.log(
        `Created Razorpay order ${razorpayOrder.id} for doctor ${doctorId}`
      );

      return {
        orderId: razorpayOrder.id,
        amount: planConfig.price,
        currency: RAZORPAY_CONSTANTS.DEFAULT_CURRENCY,
        keyId: this.config.keyId,
        customerInfo,
        notes: orderNotes,
      };
    } catch (error) {
      console.error("Error creating subscription order:", error);
      throw new Error("Failed to create payment order");
    }
  }

  /**
   * Verify payment signature and process successful payment
   */
  async verifyAndProcessPayment(
    verification: PaymentVerificationRequest
  ): Promise<{
    success: boolean;
    paymentId: string;
    subscriptionId?: string;
  }> {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        verification;

      // Verify payment signature
      const isValidSignature = verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        this.config.keySecret
      );

      if (!isValidSignature) {
        console.error("Invalid payment signature:", {
          razorpay_order_id,
          razorpay_payment_id,
        });
        await this.updatePaymentStatus(
          razorpay_payment_id,
          "FAILED",
          "Invalid signature"
        );
        return { success: false, paymentId: razorpay_payment_id };
      }

      // Fetch payment details from Razorpay
      const paymentDetails =
        await razorpayClient.fetchPayment(razorpay_payment_id);

      if (
        paymentDetails.status !== "captured" &&
        paymentDetails.status !== "authorized"
      ) {
        console.error("Payment not successful:", paymentDetails);
        await this.updatePaymentStatus(
          razorpay_payment_id,
          "FAILED",
          `Payment status: ${paymentDetails.status}`
        );
        return { success: false, paymentId: razorpay_payment_id };
      }

      // Process successful payment
      const result = await this.processSuccessfulPayment(paymentDetails);

      return {
        success: true,
        paymentId: razorpay_payment_id,
        subscriptionId: result.subscriptionId,
      };
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw new Error("Failed to verify payment");
    }
  }

  /**
   * Process successful payment and create subscription
   */
  private async processSuccessfulPayment(
    paymentDetails: RazorpayPayment
  ): Promise<{
    subscriptionId: string;
  }> {
    try {
      // Get order details to extract doctor info
      const orderDetails = await razorpayClient.fetchOrder(
        paymentDetails.order_id
      );
      const doctorId = orderDetails.notes?.doctor_id;
      const subscriptionPlan = orderDetails.notes
        ?.subscription_plan as SubscriptionPlan;

      if (!doctorId || !subscriptionPlan) {
        throw new Error("Missing doctor or plan information in order notes");
      }

      // Process in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update payment transaction status
        const paymentTransaction = await tx.paymentTransaction.upsert({
          where: { razorpay_payment_id: paymentDetails.id },
          update: {
            status: "SUCCESS",
            payment_method: paymentDetails.method,
            razorpay_order_id: paymentDetails.order_id,
          },
          create: {
            doctor_id: doctorId,
            razorpay_payment_id: paymentDetails.id,
            razorpay_order_id: paymentDetails.order_id,
            amount: paymentDetails.amount,
            currency: paymentDetails.currency,
            status: "SUCCESS",
            payment_method: paymentDetails.method,
          },
        });

        // Create subscription using subscription service
        const { SubscriptionService } = await import("./subscription.service");
        const subscriptionService = SubscriptionService.getInstance();
        const subscription = await subscriptionService.createSubscription(
          doctorId,
          subscriptionPlan,
          paymentTransaction.id
        );

        // Link payment transaction to subscription
        await tx.paymentTransaction.update({
          where: { id: paymentTransaction.id },
          data: { subscription_id: subscription.id },
        });

        return { subscriptionId: subscription.id };
      });

      console.log(
        `Processed successful payment ${paymentDetails.id} for doctor ${doctorId}`
      );
      return result;
    } catch (error) {
      console.error("Error processing successful payment:", error);
      throw new Error("Failed to process payment");
    }
  }

  /**
   * Create payment transaction record
   */
  private async createPaymentTransaction(data: {
    doctorId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    subscriptionPlan: SubscriptionPlan;
    razorpayPaymentId?: string;
  }): Promise<PaymentTransaction> {
    try {
      return await prisma.paymentTransaction.create({
        data: {
          doctor_id: data.doctorId,
          razorpay_order_id: data.razorpayOrderId,
          razorpay_payment_id: data.razorpayPaymentId || `temp_${Date.now()}`,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
        },
      });
    } catch (error) {
      console.error("Error creating payment transaction:", error);
      throw new Error("Failed to create payment transaction");
    }
  }

  /**
   * Update payment transaction status
   */
  private async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    failureReason?: string
  ): Promise<void> {
    try {
      await prisma.paymentTransaction.updateMany({
        where: {
          OR: [
            { razorpay_payment_id: paymentId },
            { razorpay_payment_id: { startsWith: "temp_" } },
          ],
        },
        data: {
          razorpay_payment_id: paymentId,
          status,
          failure_reason: failureReason,
        },
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  }

  /**
   * Handle payment failure
   */
  async handlePaymentFailure(paymentId: string, reason: string): Promise<void> {
    try {
      await this.updatePaymentStatus(paymentId, "FAILED", reason);
      console.log(`Payment ${paymentId} marked as failed: ${reason}`);
    } catch (error) {
      console.error("Error handling payment failure:", error);
    }
  }

  /**
   * Get payment history for a doctor
   */
  async getPaymentHistory(doctorId: string): Promise<PaymentTransaction[]> {
    try {
      return await prisma.paymentTransaction.findMany({
        where: { doctor_id: doctorId },
        orderBy: { created_at: "desc" },
        include: {
          subscription: {
            select: {
              id: true,
              plan: true,
              status: true,
              start_date: true,
              end_date: true,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error fetching payment history:", error);
      throw new Error("Failed to fetch payment history");
    }
  }

  /**
   * Process refund for a payment
   */
  async processRefund(
    paymentId: string,
    amount?: number
  ): Promise<{
    success: boolean;
    refundId?: string;
    error?: string;
  }> {
    try {
      // Create refund in Razorpay
      const refund = await razorpayClient.createRefund(paymentId, amount);

      // Update payment transaction
      await prisma.paymentTransaction.updateMany({
        where: { razorpay_payment_id: paymentId },
        data: { status: "REFUNDED" },
      });

      console.log(`Processed refund for payment ${paymentId}`);

      return {
        success: true,
        refundId: refund.id,
      };
    } catch (error) {
      console.error("Error processing refund:", error);
      return {
        success: false,
        error: "Failed to process refund",
      };
    }
  }

  /**
   * Get payment statistics for analytics
   */
  async getPaymentStatistics(doctorId?: string): Promise<{
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    totalRevenue: number;
    averageOrderValue: number;
    successRate: number;
  }> {
    try {
      const whereClause = doctorId ? { doctor_id: doctorId } : {};

      const payments = await prisma.paymentTransaction.findMany({
        where: whereClause,
        select: {
          status: true,
          amount: true,
        },
      });

      const totalPayments = payments.length;
      const successfulPayments = payments.filter(
        (p) => p.status === "SUCCESS"
      ).length;
      const failedPayments = payments.filter(
        (p) => p.status === "FAILED"
      ).length;
      const totalRevenue = payments
        .filter((p) => p.status === "SUCCESS")
        .reduce((sum, p) => sum + p.amount, 0);

      const averageOrderValue =
        successfulPayments > 0 ? totalRevenue / successfulPayments : 0;
      const successRate =
        totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

      return {
        totalPayments,
        successfulPayments,
        failedPayments,
        totalRevenue,
        averageOrderValue,
        successRate,
      };
    } catch (error) {
      console.error("Error fetching payment statistics:", error);
      throw new Error("Failed to fetch payment statistics");
    }
  }

  /**
   * Validate payment amount against subscription plan
   */
  validatePaymentAmount(plan: SubscriptionPlan, amount: number): boolean {
    const planConfig = SUBSCRIPTION_PLANS[plan];
    return planConfig && planConfig.price === amount;
  }

  /**
   * Get pending payments (for cleanup/monitoring)
   */
  async getPendingPayments(
    olderThanMinutes: number = 30
  ): Promise<PaymentTransaction[]> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - olderThanMinutes);

      return await prisma.paymentTransaction.findMany({
        where: {
          status: "PENDING",
          created_at: { lt: cutoffTime },
        },
        include: {
          doctor: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    } catch (error) {
      console.error("Error fetching pending payments:", error);
      throw new Error("Failed to fetch pending payments");
    }
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance();
