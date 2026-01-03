'use client';

import { useState } from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import { useRouter } from 'next/navigation';

export const usePremiumFeature = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<string>('');

  // Safely get subscription context
  let subscriptionStatus = null;
  try {
    const context = useSubscription();
    subscriptionStatus = context.subscriptionStatus;
  } catch (error) {
    // If useSubscription fails, assume no subscription
    console.warn('useSubscription called outside of SubscriptionProvider');
    subscriptionStatus = null;
  }

  const router = useRouter();

  const checkFeatureAccess = (featureName: string, callback?: () => void) => {
    // Check if user has active subscription
    if (subscriptionStatus?.isActive) {
      // User has premium access, execute the callback
      if (callback) callback();
      return true;
    }

    // User doesn't have premium access, show upgrade modal
    setCurrentFeature(featureName);
    setShowUpgradeModal(true);
    return false;
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    router.push('/dashboard/doctor/subscription');
  };

  const closeModal = () => {
    setShowUpgradeModal(false);
    setCurrentFeature('');
  };

  return {
    showUpgradeModal,
    currentFeature,
    checkFeatureAccess,
    handleUpgrade,
    closeModal,
    hasActiveSubscription: subscriptionStatus?.isActive || false
  };
};