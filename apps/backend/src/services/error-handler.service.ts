import { auditService } from './audit.service';

export interface ErrorContext {
  userId?: string;
  subscriptionId?: string;
  paymentId?: string;
  action?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserFriendlyError {
  code: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  suggestedActions: string[];
  supportContact?: boolean;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  retryableErrors: string[];
}

export class ErrorHandlerService {
  private defaultRetryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'TEMPORARY_FAILURE',
      'RATE_LIMIT_EXCEEDED',
      'GATEWAY_TIMEOUT'
    ]
  };

  /**
   * Handle payment-related errors with user-friendly messages
   */
  handlePaymentError(error: any, context: ErrorContext): UserFriendlyError {
    const errorCode = this.extractErrorCode(error);
    const errorMessage = error.message || 'Unknown error occurred';

    // Log the error for audit purposes
    this.logError('PAYMENT', error, context);

    // Map technical errors to user-friendly messages
    const userFriendlyError = this.mapPaymentErrorToUserMessage(errorCode, errorMessage);

    return userFriendlyError;
  }

  /**
   * Handle subscription-related errors
   */
  handleSubscriptionError(error: any, context: ErrorContext): UserFriendlyError {
    const errorCode = this.extractErrorCode(error);
    const errorMessage = error.message || 'Unknown error occurred';

    this.logError('SUBSCRIPTION', error, context);

    return this.mapSubscriptionErrorToUserMessage(errorCode, errorMessage);
  }

  /**
   * Handle network and API errors
   */
  handleNetworkError(error: any, context: ErrorContext): UserFriendlyError {
    const errorCode = this.extractErrorCode(error);
    const errorMessage = error.message || 'Network error occurred';

    this.logError('NETWORK', error, context);

    return this.mapNetworkErrorToUserMessage(errorCode, errorMessage);
  }

  /**
   * Retry mechanism with exponential backoff
   */
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: any;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        // Log successful retry if it wasn't the first attempt
        if (attempt > 1) {
          await auditService.logError(
            'RETRY',
            context.paymentId || context.subscriptionId || 'unknown',
            new Error(`Operation succeeded on attempt ${attempt}`),
            { ...context, attempt, success: true }
          );
        }
        
        return result;
      } catch (error) {
        lastError = error;
        const errorCode = this.extractErrorCode(error);

        // Check if error is retryable
        if (!this.isRetryableError(errorCode, retryConfig.retryableErrors)) {
          throw error;
        }

        // Don't retry on the last attempt
        if (attempt === retryConfig.maxAttempts) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
          retryConfig.maxDelay
        );

        // Log retry attempt
        await auditService.logError(
          'RETRY',
          context.paymentId || context.subscriptionId || 'unknown',
          error,
          { ...context, attempt, nextRetryIn: delay }
        );

        // Wait before retrying
        await this.sleep(delay);
      }
    }

    // All retries failed
    await auditService.logError(
      'RETRY_FAILED',
      context.paymentId || context.subscriptionId || 'unknown',
      lastError,
      { ...context, totalAttempts: retryConfig.maxAttempts }
    );

    throw lastError;
  }

  /**
   * Check if service is available (circuit breaker pattern)
   */
  async checkServiceHealth(serviceName: string): Promise<{
    available: boolean;
    message: string;
    degraded: boolean;
  }> {
    try {
      // In a real implementation, you would check actual service health
      // For now, we'll simulate health checks
      
      const healthChecks = {
        razorpay: await this.checkRazorpayHealth(),
        database: await this.checkDatabaseHealth(),
        notification: await this.checkNotificationHealth()
      };

      const isAvailable = healthChecks[serviceName as keyof typeof healthChecks];
      
      return {
        available: isAvailable,
        message: isAvailable ? 'Service is healthy' : 'Service is experiencing issues',
        degraded: !isAvailable
      };
    } catch (error) {
      return {
        available: false,
        message: 'Unable to check service health',
        degraded: true
      };
    }
  }

  /**
   * Get graceful degradation options for service outages
   */
  getGracefulDegradationOptions(serviceName: string): {
    fallbackOptions: string[];
    userMessage: string;
    estimatedRecovery?: string;
  } {
    const degradationMap = {
      razorpay: {
        fallbackOptions: [
          'Try again in a few minutes',
          'Use alternative payment method',
          'Contact support for manual processing'
        ],
        userMessage: 'Payment processing is temporarily unavailable. Please try again shortly.',
        estimatedRecovery: '5-10 minutes'
      },
      database: {
        fallbackOptions: [
          'Retry the operation',
          'Use cached data where available',
          'Contact support if issue persists'
        ],
        userMessage: 'We are experiencing technical difficulties. Please try again.',
        estimatedRecovery: '2-5 minutes'
      },
      notification: {
        fallbackOptions: [
          'Notifications will be sent once service recovers',
          'Check your subscription status manually',
          'Contact support for urgent notifications'
        ],
        userMessage: 'Notification service is temporarily unavailable. Your subscription is still active.',
        estimatedRecovery: '10-15 minutes'
      }
    };

    return degradationMap[serviceName as keyof typeof degradationMap] || {
      fallbackOptions: ['Try again later', 'Contact support'],
      userMessage: 'Service is temporarily unavailable. Please try again later.'
    };
  }

  /**
   * Map payment errors to user-friendly messages
   */
  private mapPaymentErrorToUserMessage(errorCode: string, errorMessage: string): UserFriendlyError {
    const errorMap: Record<string, UserFriendlyError> = {
      'PAYMENT_FAILED': {
        code: 'PAYMENT_FAILED',
        message: errorMessage,
        userMessage: 'Your payment could not be processed. Please check your payment details and try again.',
        severity: 'medium',
        retryable: true,
        suggestedActions: [
          'Verify your card details are correct',
          'Ensure sufficient balance in your account',
          'Try a different payment method',
          'Contact your bank if the issue persists'
        ]
      },
      'CARD_DECLINED': {
        code: 'CARD_DECLINED',
        message: errorMessage,
        userMessage: 'Your card was declined. Please try a different payment method.',
        severity: 'medium',
        retryable: true,
        suggestedActions: [
          'Contact your bank to authorize the transaction',
          'Try a different card',
          'Use UPI or net banking instead'
        ]
      },
      'INSUFFICIENT_FUNDS': {
        code: 'INSUFFICIENT_FUNDS',
        message: errorMessage,
        userMessage: 'Insufficient funds in your account. Please add funds and try again.',
        severity: 'medium',
        retryable: true,
        suggestedActions: [
          'Add funds to your account',
          'Try a different payment method',
          'Use a different card'
        ]
      },
      'NETWORK_ERROR': {
        code: 'NETWORK_ERROR',
        message: errorMessage,
        userMessage: 'Network connection issue. Please check your internet and try again.',
        severity: 'low',
        retryable: true,
        suggestedActions: [
          'Check your internet connection',
          'Try again in a few moments',
          'Refresh the page'
        ]
      },
      'GATEWAY_TIMEOUT': {
        code: 'GATEWAY_TIMEOUT',
        message: errorMessage,
        userMessage: 'Payment processing is taking longer than usual. Please wait and try again.',
        severity: 'medium',
        retryable: true,
        suggestedActions: [
          'Wait a few minutes and try again',
          'Check if payment was already processed',
          'Contact support if issue persists'
        ]
      },
      'INVALID_PAYMENT_METHOD': {
        code: 'INVALID_PAYMENT_METHOD',
        message: errorMessage,
        userMessage: 'The selected payment method is not valid. Please choose a different option.',
        severity: 'medium',
        retryable: false,
        suggestedActions: [
          'Select a different payment method',
          'Verify your payment details',
          'Contact support for assistance'
        ]
      }
    };

    return errorMap[errorCode] || {
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
      userMessage: 'An unexpected error occurred. Please try again or contact support.',
      severity: 'medium',
      retryable: true,
      suggestedActions: [
        'Try again in a few minutes',
        'Refresh the page',
        'Contact support if the issue persists'
      ],
      supportContact: true
    };
  }

  /**
   * Map subscription errors to user-friendly messages
   */
  private mapSubscriptionErrorToUserMessage(errorCode: string, errorMessage: string): UserFriendlyError {
    const errorMap: Record<string, UserFriendlyError> = {
      'SUBSCRIPTION_NOT_FOUND': {
        code: 'SUBSCRIPTION_NOT_FOUND',
        message: errorMessage,
        userMessage: 'Subscription not found. Please check your account or contact support.',
        severity: 'high',
        retryable: false,
        suggestedActions: [
          'Verify your account details',
          'Check if you have an active subscription',
          'Contact support for assistance'
        ],
        supportContact: true
      },
      'SUBSCRIPTION_EXPIRED': {
        code: 'SUBSCRIPTION_EXPIRED',
        message: errorMessage,
        userMessage: 'Your subscription has expired. Please renew to continue using premium features.',
        severity: 'high',
        retryable: false,
        suggestedActions: [
          'Renew your subscription',
          'Choose a new plan',
          'Contact support for renewal assistance'
        ]
      },
      'SUBSCRIPTION_CANCELLED': {
        code: 'SUBSCRIPTION_CANCELLED',
        message: errorMessage,
        userMessage: 'Your subscription has been cancelled. You can reactivate it anytime.',
        severity: 'medium',
        retryable: false,
        suggestedActions: [
          'Reactivate your subscription',
          'Choose a new plan',
          'Contact support if you need help'
        ]
      }
    };

    return errorMap[errorCode] || {
      code: 'SUBSCRIPTION_ERROR',
      message: errorMessage,
      userMessage: 'There was an issue with your subscription. Please try again or contact support.',
      severity: 'medium',
      retryable: true,
      suggestedActions: [
        'Try again in a few minutes',
        'Check your subscription status',
        'Contact support for assistance'
      ],
      supportContact: true
    };
  }

  /**
   * Map network errors to user-friendly messages
   */
  private mapNetworkErrorToUserMessage(errorCode: string, errorMessage: string): UserFriendlyError {
    const errorMap: Record<string, UserFriendlyError> = {
      'NETWORK_ERROR': {
        code: 'NETWORK_ERROR',
        message: errorMessage,
        userMessage: 'Unable to connect to our servers. Please check your internet connection.',
        severity: 'low',
        retryable: true,
        suggestedActions: [
          'Check your internet connection',
          'Try again in a few moments',
          'Refresh the page'
        ]
      },
      'TIMEOUT_ERROR': {
        code: 'TIMEOUT_ERROR',
        message: errorMessage,
        userMessage: 'The request timed out. Please try again.',
        severity: 'low',
        retryable: true,
        suggestedActions: [
          'Try again',
          'Check your internet speed',
          'Wait a moment and retry'
        ]
      },
      'SERVER_ERROR': {
        code: 'SERVER_ERROR',
        message: errorMessage,
        userMessage: 'Our servers are experiencing issues. Please try again shortly.',
        severity: 'high',
        retryable: true,
        suggestedActions: [
          'Try again in a few minutes',
          'Check our status page',
          'Contact support if issue persists'
        ]
      }
    };

    return errorMap[errorCode] || {
      code: 'UNKNOWN_NETWORK_ERROR',
      message: errorMessage,
      userMessage: 'A network error occurred. Please check your connection and try again.',
      severity: 'medium',
      retryable: true,
      suggestedActions: [
        'Check your internet connection',
        'Try again',
        'Contact support if issue persists'
      ]
    };
  }

  /**
   * Extract error code from various error formats
   */
  private extractErrorCode(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error.code) {
      return error.code;
    }

    if (error.response?.data?.error?.code) {
      return error.response.data.error.code;
    }

    if (error.name) {
      return error.name;
    }

    if (error.message) {
      // Try to extract code from message
      const codeMatch = error.message.match(/code:\s*(\w+)/i);
      if (codeMatch) {
        return codeMatch[1];
      }
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(errorCode: string, retryableErrors: string[]): boolean {
    return retryableErrors.includes(errorCode) || 
           errorCode.includes('TIMEOUT') || 
           errorCode.includes('NETWORK') ||
           errorCode.includes('TEMPORARY');
  }

  /**
   * Log error for audit purposes
   */
  private async logError(type: string, error: any, context: ErrorContext): Promise<void> {
    try {
      await auditService.logError(
        type as any,
        context.paymentId || context.subscriptionId || 'unknown',
        error,
        context,
        context.userId
      );
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health check utilities
   */
  private async checkRazorpayHealth(): Promise<boolean> {
    try {
      // In a real implementation, you would ping Razorpay API
      return true;
    } catch {
      return false;
    }
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      // In a real implementation, you would check database connectivity
      return true;
    } catch {
      return false;
    }
  }

  private async checkNotificationHealth(): Promise<boolean> {
    try {
      // In a real implementation, you would check notification service
      return true;
    } catch {
      return false;
    }
  }
}

export const errorHandlerService = new ErrorHandlerService();