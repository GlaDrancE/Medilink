'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { subscriptionApi, handleSubscriptionError } from '@/services/subscription.api';

// Types
interface SubscriptionStatus {
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'CANCELLED' | 'GRACE_PERIOD';
  isActive: boolean;
  expiresAt?: string;
  daysUntilExpiry?: number;
  subscription?: {
    planName: string;
    status: string;
    displayPrice: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
    isActive: boolean;
    features: string[];
    description: string;
  };
}

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;
  hasFeatureAccess: (feature: string) => boolean;
  refreshSubscriptionStatus: () => Promise<void>;
  checkFeatureAccess: (feature: string) => Promise<boolean>;
  redirectToSubscription: () => void;
}

// Create context
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Provider component
export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription status
  const fetchSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await subscriptionApi.getStatus();

      if (response.success) {
        setSubscriptionStatus(response.data);
      } else {
        setError('Failed to fetch subscription status');
      }
    } catch (err: any) {
      const errorInfo = handleSubscriptionError(err);
      setError(errorInfo.message);

      // If no subscription, set inactive status
      if (errorInfo.requiresSubscription) {
        setSubscriptionStatus({
          status: 'INACTIVE',
          isActive: false
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has access to a specific feature
  const hasFeatureAccess = (feature: string): boolean => {
    if (!subscriptionStatus) return false;

    // Free features that don't require subscription
    const freeFeatures = ['VIEW_PATIENTS', 'VIEW_PRESCRIPTIONS', 'PATIENT_SEARCH'];
    if (freeFeatures.includes(feature)) return true;

    // Premium features require active subscription or grace period
    return subscriptionStatus.isActive || subscriptionStatus.status === 'GRACE_PERIOD';
  };

  // Check feature access via API (for real-time validation)
  const checkFeatureAccess = async (feature: string): Promise<boolean> => {
    try {
      const response = await subscriptionApi.checkFeatureAccess(feature);
      return response.success && response.data.hasAccess;
    } catch (err: any) {
      const errorInfo = handleSubscriptionError(err);
      return !errorInfo.requiresSubscription;
    }
  };

  // Refresh subscription status
  const refreshSubscriptionStatus = async () => {
    await fetchSubscriptionStatus();
  };

  // Redirect to subscription page
  const redirectToSubscription = () => {
    // In a real app, you might use Next.js router
    window.location.href = '/dashboard/doctor/subscription';
  };

  // Fetch subscription status on mount
  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  // Auto-refresh subscription status every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSubscriptionStatus();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const value: SubscriptionContextType = {
    subscriptionStatus,
    isLoading,
    error,
    hasFeatureAccess,
    refreshSubscriptionStatus,
    checkFeatureAccess,
    redirectToSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Hook to use subscription context
export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// Hook for feature access checking
export const useFeatureAccess = (feature: string) => {
  const { hasFeatureAccess, checkFeatureAccess, subscriptionStatus, redirectToSubscription } = useSubscription();
  const [isChecking, setIsChecking] = useState(false);

  const checkAccess = async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const hasAccess = await checkFeatureAccess(feature);
      return hasAccess;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    hasAccess: hasFeatureAccess(feature),
    checkAccess,
    isChecking,
    subscriptionStatus,
    redirectToSubscription
  };
};