import { useState, useCallback } from 'react';

export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorCode?: string;
  userMessage?: string;
  retryable?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

export interface ErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onRetry?: (retryCount: number) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onRetry,
    onMaxRetriesReached
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    retryCount: 0,
    maxRetries
  });

  const [isRetrying, setIsRetrying] = useState(false);

  // Clear error state
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      retryCount: 0,
      maxRetries
    });
    setIsRetrying(false);
  }, [maxRetries]);

  // Handle error with user-friendly message mapping
  const handleError = useCallback((error: Error | any, context?: string) => {
    const mappedError = mapErrorToUserFriendly(error, context);
    
    setErrorState(prev => ({
      hasError: true,
      error: error instanceof Error ? error : new Error(String(error)),
      errorCode: mappedError.code,
      userMessage: mappedError.userMessage,
      retryable: mappedError.retryable,
      retryCount: prev.retryCount || 0,
      maxRetries
    }));

    if (onError) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [maxRetries, onError]);

  // Retry mechanism
  const retry = useCallback(async (operation: () => Promise<any>) => {
    if (!errorState.retryable || (errorState.retryCount || 0) >= maxRetries) {
      if (onMaxRetriesReached && errorState.error) {
        onMaxRetriesReached(errorState.error);
      }
      return;
    }

    setIsRetrying(true);
    const newRetryCount = (errorState.retryCount || 0) + 1;

    try {
      // Add delay before retry
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * newRetryCount));
      }

      if (onRetry) {
        onRetry(newRetryCount);
      }

      const result = await operation();
      clearError();
      return result;
    } catch (error) {
      setErrorState(prev => ({
        ...prev,
        retryCount: newRetryCount
      }));

      if (newRetryCount >= maxRetries && onMaxRetriesReached) {
        onMaxRetriesReached(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      setIsRetrying(false);
    }
  }, [errorState, maxRetries, retryDelay, onRetry, onMaxRetriesReached, clearError]);

  // Execute operation with error handling
  const executeWithErrorHandling = useCallback(async (
    operation: () => Promise<any>,
    context?: string
  ) => {
    try {
      clearError();
      return await operation();
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }, [handleError, clearError]);

  return {
    errorState,
    isRetrying,
    handleError,
    clearError,
    retry,
    executeWithErrorHandling,
    canRetry: errorState.retryable && (errorState.retryCount || 0) < maxRetries
  };
};

// Map technical errors to user-friendly messages
const mapErrorToUserFriendly = (error: any, context?: string) => {
  const errorMessage = error?.message || String(error);
  const errorCode = error?.code || error?.response?.data?.error?.code || 'UNKNOWN_ERROR';

  // Payment-specific errors
  if (context === 'payment') {
    return mapPaymentError(errorCode, errorMessage);
  }

  // Subscription-specific errors
  if (context === 'subscription') {
    return mapSubscriptionError(errorCode, errorMessage);
  }

  // Network errors
  if (errorCode.includes('NETWORK') || errorCode.includes('TIMEOUT')) {
    return {
      code: errorCode,
      userMessage: 'Network connection issue. Please check your internet and try again.',
      retryable: true
    };
  }

  // Authentication errors
  if (errorCode === 'UNAUTHORIZED' || error?.response?.status === 401) {
    return {
      code: 'UNAUTHORIZED',
      userMessage: 'Your session has expired. Please log in again.',
      retryable: false
    };
  }

  // Server errors
  if (error?.response?.status >= 500) {
    return {
      code: 'SERVER_ERROR',
      userMessage: 'Our servers are experiencing issues. Please try again shortly.',
      retryable: true
    };
  }

  // Default error
  return {
    code: errorCode,
    userMessage: 'An unexpected error occurred. Please try again or contact support.',
    retryable: true
  };
};

const mapPaymentError = (errorCode: string, errorMessage: string) => {
  const paymentErrorMap: Record<string, { userMessage: string; retryable: boolean }> = {
    'PAYMENT_FAILED': {
      userMessage: 'Your payment could not be processed. Please check your payment details and try again.',
      retryable: true
    },
    'CARD_DECLINED': {
      userMessage: 'Your card was declined. Please try a different payment method.',
      retryable: true
    },
    'INSUFFICIENT_FUNDS': {
      userMessage: 'Insufficient funds in your account. Please add funds and try again.',
      retryable: true
    },
    'INVALID_CARD': {
      userMessage: 'Invalid card details. Please check your card information.',
      retryable: false
    },
    'EXPIRED_CARD': {
      userMessage: 'Your card has expired. Please use a different card.',
      retryable: false
    },
    'GATEWAY_TIMEOUT': {
      userMessage: 'Payment processing is taking longer than usual. Please wait and try again.',
      retryable: true
    }
  };

  return {
    code: errorCode,
    ...paymentErrorMap[errorCode] || {
      userMessage: 'Payment processing failed. Please try again or contact support.',
      retryable: true
    }
  };
};

const mapSubscriptionError = (errorCode: string, errorMessage: string) => {
  const subscriptionErrorMap: Record<string, { userMessage: string; retryable: boolean }> = {
    'SUBSCRIPTION_NOT_FOUND': {
      userMessage: 'Subscription not found. Please check your account or contact support.',
      retryable: false
    },
    'SUBSCRIPTION_EXPIRED': {
      userMessage: 'Your subscription has expired. Please renew to continue using premium features.',
      retryable: false
    },
    'SUBSCRIPTION_CANCELLED': {
      userMessage: 'Your subscription has been cancelled. You can reactivate it anytime.',
      retryable: false
    },
    'PLAN_NOT_AVAILABLE': {
      userMessage: 'The selected plan is not available. Please choose a different plan.',
      retryable: false
    }
  };

  return {
    code: errorCode,
    ...subscriptionErrorMap[errorCode] || {
      userMessage: 'There was an issue with your subscription. Please try again or contact support.',
      retryable: true
    }
  };
};

// Hook for handling async operations with loading and error states
export const useAsyncOperation = <T = any>(options: ErrorHandlerOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const errorHandler = useErrorHandler(options);

  const execute = useCallback(async (
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    setIsLoading(true);
    try {
      const result = await errorHandler.executeWithErrorHandling(operation, context);
      setData(result);
      return result;
    } catch (error) {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [errorHandler]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setData(null);
    errorHandler.clearError();
  }, [errorHandler]);

  return {
    isLoading,
    data,
    execute,
    reset,
    ...errorHandler
  };
};