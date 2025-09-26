import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ErrorHandlerService } from '../services/error-handler.service';

describe('ErrorHandlerService', () => {
  let errorHandlerService: ErrorHandlerService;

  beforeEach(() => {
    errorHandlerService = new ErrorHandlerService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handlePaymentError', () => {
    it('should map payment failed error correctly', () => {
      const error = { code: 'PAYMENT_FAILED', message: 'Payment processing failed' };
      const context = { paymentId: 'pay_123', userId: 'user_123' };

      const result = errorHandlerService.handlePaymentError(error, context);

      expect(result).toMatchObject({
        code: 'PAYMENT_FAILED',
        userMessage: 'Your payment could not be processed. Please check your payment details and try again.',
        severity: 'medium',
        retryable: true,
        suggestedActions: expect.arrayContaining([
          'Verify your card details are correct',
          'Ensure sufficient balance in your account'
        ])
      });
    });

    it('should map card declined error correctly', () => {
      const error = { code: 'CARD_DECLINED', message: 'Card was declined by bank' };
      const context = { paymentId: 'pay_123' };

      const result = errorHandlerService.handlePaymentError(error, context);

      expect(result).toMatchObject({
        code: 'CARD_DECLINED',
        userMessage: 'Your card was declined. Please try a different payment method.',
        severity: 'medium',
        retryable: true
      });
    });

    it('should handle unknown payment errors', () => {
      const error = { code: 'UNKNOWN_PAYMENT_ERROR', message: 'Unknown error' };
      const context = { paymentId: 'pay_123' };

      const result = errorHandlerService.handlePaymentError(error, context);

      expect(result).toMatchObject({
        code: 'UNKNOWN_ERROR',
        userMessage: 'An unexpected error occurred. Please try again or contact support.',
        severity: 'medium',
        retryable: true,
        supportContact: true
      });
    });
  });

  describe('handleSubscriptionError', () => {
    it('should map subscription not found error correctly', () => {
      const error = { code: 'SUBSCRIPTION_NOT_FOUND', message: 'Subscription not found' };
      const context = { subscriptionId: 'sub_123', userId: 'user_123' };

      const result = errorHandlerService.handleSubscriptionError(error, context);

      expect(result).toMatchObject({
        code: 'SUBSCRIPTION_NOT_FOUND',
        userMessage: 'Subscription not found. Please check your account or contact support.',
        severity: 'high',
        retryable: false,
        supportContact: true
      });
    });

    it('should map subscription expired error correctly', () => {
      const error = { code: 'SUBSCRIPTION_EXPIRED', message: 'Subscription has expired' };
      const context = { subscriptionId: 'sub_123' };

      const result = errorHandlerService.handleSubscriptionError(error, context);

      expect(result).toMatchObject({
        code: 'SUBSCRIPTION_EXPIRED',
        userMessage: 'Your subscription has expired. Please renew to continue using premium features.',
        severity: 'high',
        retryable: false
      });
    });
  });

  describe('handleNetworkError', () => {
    it('should map network error correctly', () => {
      const error = { code: 'NETWORK_ERROR', message: 'Network connection failed' };
      const context = { userId: 'user_123' };

      const result = errorHandlerService.handleNetworkError(error, context);

      expect(result).toMatchObject({
        code: 'NETWORK_ERROR',
        userMessage: 'Unable to connect to our servers. Please check your internet connection.',
        severity: 'low',
        retryable: true
      });
    });

    it('should map timeout error correctly', () => {
      const error = { code: 'TIMEOUT_ERROR', message: 'Request timed out' };
      const context = { userId: 'user_123' };

      const result = errorHandlerService.handleNetworkError(error, context);

      expect(result).toMatchObject({
        code: 'TIMEOUT_ERROR',
        userMessage: 'The request timed out. Please try again.',
        severity: 'low',
        retryable: true
      });
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success');
      const context = { paymentId: 'pay_123' };

      const result = await errorHandlerService.retryWithBackoff(mockOperation, context);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new Error('NETWORK_ERROR'))
        .mockRejectedValueOnce(new Error('TIMEOUT_ERROR'))
        .mockResolvedValue('success');

      const context = { paymentId: 'pay_123' };
      const config = { maxAttempts: 3, baseDelay: 10 }; // Short delay for testing

      const result = await errorHandlerService.retryWithBackoff(mockOperation, context, config);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('INVALID_CARD'));
      const context = { paymentId: 'pay_123' };
      const config = { retryableErrors: ['NETWORK_ERROR', 'TIMEOUT_ERROR'] };

      await expect(
        errorHandlerService.retryWithBackoff(mockOperation, context, config)
      ).rejects.toThrow('INVALID_CARD');

      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should stop retrying after max attempts', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('NETWORK_ERROR'));
      const context = { paymentId: 'pay_123' };
      const config = { maxAttempts: 2, baseDelay: 10 };

      await expect(
        errorHandlerService.retryWithBackoff(mockOperation, context, config)
      ).rejects.toThrow('NETWORK_ERROR');

      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should apply exponential backoff', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new Error('NETWORK_ERROR'))
        .mockRejectedValueOnce(new Error('NETWORK_ERROR'))
        .mockResolvedValue('success');

      const context = { paymentId: 'pay_123' };
      const config = { 
        maxAttempts: 3, 
        baseDelay: 100, 
        backoffMultiplier: 2,
        maxDelay: 1000
      };

      const startTime = Date.now();
      const result = await errorHandlerService.retryWithBackoff(mockOperation, context, config);
      const endTime = Date.now();

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
      
      // Should have waited at least 100ms + 200ms = 300ms
      expect(endTime - startTime).toBeGreaterThanOrEqual(300);
    });
  });

  describe('checkServiceHealth', () => {
    it('should return healthy status for available services', async () => {
      // Mock the private health check methods
      vi.spyOn(errorHandlerService as any, 'checkRazorpayHealth').mockResolvedValue(true);

      const result = await errorHandlerService.checkServiceHealth('razorpay');

      expect(result).toEqual({
        available: true,
        message: 'Service is healthy',
        degraded: false
      });
    });

    it('should return degraded status for unavailable services', async () => {
      vi.spyOn(errorHandlerService as any, 'checkDatabaseHealth').mockResolvedValue(false);

      const result = await errorHandlerService.checkServiceHealth('database');

      expect(result).toEqual({
        available: false,
        message: 'Service is experiencing issues',
        degraded: true
      });
    });

    it('should handle health check errors', async () => {
      vi.spyOn(errorHandlerService as any, 'checkRazorpayHealth').mockRejectedValue(new Error('Health check failed'));

      const result = await errorHandlerService.checkServiceHealth('razorpay');

      expect(result).toEqual({
        available: false,
        message: 'Unable to check service health',
        degraded: true
      });
    });
  });

  describe('getGracefulDegradationOptions', () => {
    it('should return razorpay degradation options', () => {
      const result = errorHandlerService.getGracefulDegradationOptions('razorpay');

      expect(result).toMatchObject({
        fallbackOptions: expect.arrayContaining([
          'Try again in a few minutes',
          'Use alternative payment method'
        ]),
        userMessage: 'Payment processing is temporarily unavailable. Please try again shortly.',
        estimatedRecovery: '5-10 minutes'
      });
    });

    it('should return database degradation options', () => {
      const result = errorHandlerService.getGracefulDegradationOptions('database');

      expect(result).toMatchObject({
        fallbackOptions: expect.arrayContaining([
          'Retry the operation',
          'Use cached data where available'
        ]),
        userMessage: 'We are experiencing technical difficulties. Please try again.',
        estimatedRecovery: '2-5 minutes'
      });
    });

    it('should return default options for unknown services', () => {
      const result = errorHandlerService.getGracefulDegradationOptions('unknown-service');

      expect(result).toMatchObject({
        fallbackOptions: ['Try again later', 'Contact support'],
        userMessage: 'Service is temporarily unavailable. Please try again later.'
      });
    });
  });

  describe('error code extraction', () => {
    it('should extract code from error object', () => {
      const error = { code: 'PAYMENT_FAILED', message: 'Payment failed' };
      const result = errorHandlerService.handlePaymentError(error, {});
      expect(result.code).toBe('PAYMENT_FAILED');
    });

    it('should extract code from nested response', () => {
      const error = {
        response: {
          data: {
            error: {
              code: 'CARD_DECLINED'
            }
          }
        }
      };
      const result = errorHandlerService.handlePaymentError(error, {});
      expect(result.code).toBe('CARD_DECLINED');
    });

    it('should use error name as fallback', () => {
      const error = { name: 'NetworkError', message: 'Network failed' };
      const result = errorHandlerService.handleNetworkError(error, {});
      expect(result.code).toBe('NetworkError');
    });

    it('should extract code from message', () => {
      const error = { message: 'Error occurred: code: TIMEOUT_ERROR' };
      const result = errorHandlerService.handleNetworkError(error, {});
      expect(result.code).toBe('TIMEOUT_ERROR');
    });

    it('should default to UNKNOWN_ERROR', () => {
      const error = { message: 'Some random error' };
      const result = errorHandlerService.handlePaymentError(error, {});
      expect(result.code).toBe('UNKNOWN_ERROR');
    });
  });
});