'use client';

import React, { useState } from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, AlertTriangle, Clock, Crown, Zap } from 'lucide-react';

export const SubscriptionBanner: React.FC = () => {
  const { subscriptionStatus, redirectToSubscription } = useSubscription();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if dismissed or no subscription status
  if (isDismissed || !subscriptionStatus) {
    return null;
  }

  // Don't show banner for active subscriptions (unless expiring soon)
  if (subscriptionStatus.isActive && (subscriptionStatus.daysUntilExpiry || 0) > 7) {
    return null;
  }

  const getBannerConfig = () => {
    const { status, daysUntilExpiry } = subscriptionStatus;

    switch (status) {
      case 'INACTIVE':
        return {
          title: 'Unlock Premium Features',
          message: 'Subscribe to add unlimited patients, create digital prescriptions, and send automated reminders. Starting from ₹99/month.',
          icon: <Crown className="h-5 w-5" />,
          color: 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200',
          textColor: 'text-blue-800',
          buttonText: 'Start Free Trial',
          buttonVariant: 'default' as const,
          dismissible: true
        };

      case 'EXPIRED':
        return {
          title: 'Subscription Expired',
          message: 'Renew your subscription to continue using premium features',
          icon: <AlertTriangle className="h-5 w-5" />,
          color: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          buttonText: 'Renew Now',
          buttonVariant: 'destructive' as const,
          dismissible: false
        };

      case 'GRACE_PERIOD':
        return {
          title: 'Grace Period Active',
          message: `Your subscription expired but you have ${daysUntilExpiry || 0} days left to renew`,
          icon: <Clock className="h-5 w-5" />,
          color: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800',
          buttonText: 'Renew Now',
          buttonVariant: 'default' as const,
          dismissible: false
        };

      case 'CANCELLED':
        return {
          title: 'Subscription Cancelled',
          message: `Access continues until ${new Date(subscriptionStatus.expiresAt || '').toLocaleDateString()}`,
          icon: <AlertTriangle className="h-5 w-5" />,
          color: 'bg-orange-50 border-orange-200',
          textColor: 'text-orange-800',
          buttonText: 'Reactivate',
          buttonVariant: 'default' as const,
          dismissible: true
        };

      case 'ACTIVE':
        // Only show for expiring soon
        if ((daysUntilExpiry || 0) <= 7) {
          return {
            title: 'Subscription Expiring Soon',
            message: `Your subscription expires in ${daysUntilExpiry} days`,
            icon: <Zap className="h-5 w-5" />,
            color: 'bg-amber-50 border-amber-200',
            textColor: 'text-amber-800',
            buttonText: 'Renew Early',
            buttonVariant: 'default' as const,
            dismissible: true
          };
        }
        return null;

      default:
        return null;
    }
  };

  const config = getBannerConfig();
  if (!config) return null;

  return (
    <Card className={`mb-6 ${config.color}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={config.textColor}>
              {config.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className={`font-semibold ${config.textColor}`}>
                  {config.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {subscriptionStatus.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className={`text-sm ${config.textColor} opacity-90`}>
                {config.message}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={redirectToSubscription}
              variant={config.buttonVariant}
              size="sm"
            >
              {config.buttonText}
            </Button>
            
            {config.dismissible && (
              <Button
                onClick={() => setIsDismissed(true)}
                variant="ghost"
                size="sm"
                className={`${config.textColor} hover:bg-transparent`}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Compact subscription banner for smaller spaces
export const CompactSubscriptionBanner: React.FC = () => {
  const { subscriptionStatus, redirectToSubscription } = useSubscription();

  if (!subscriptionStatus || subscriptionStatus.isActive) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Crown className="h-4 w-4" />
          <span className="text-sm font-medium">
            Upgrade to unlock all features
          </span>
        </div>
        <Button
          onClick={redirectToSubscription}
          variant="secondary"
          size="sm"
          className="text-xs"
        >
          Subscribe
        </Button>
      </div>
    </div>
  );
};