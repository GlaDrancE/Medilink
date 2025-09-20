'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Crown, Lock, Clock, CheckCircle } from 'lucide-react';

interface SubscriptionGateProps {
  feature: 'NEW_PATIENT' | 'CREATE_PRESCRIPTION' | 'SEND_REMINDER';
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  className?: string;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  className = ''
}) => {
  const { hasFeatureAccess, subscriptionStatus, redirectToSubscription } = useSubscription();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to prevent flashing
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state
  if (isChecking || !subscriptionStatus) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user has access
  const hasAccess = hasFeatureAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show default subscription prompt
  if (showUpgradePrompt) {
    return (
      <div className={className}>
        <SubscriptionPrompt 
          feature={feature}
          subscriptionStatus={subscriptionStatus}
          onUpgrade={redirectToSubscription}
        />
      </div>
    );
  }

  // Don't render anything if no upgrade prompt
  return null;
};

// Subscription prompt component
interface SubscriptionPromptProps {
  feature: string;
  subscriptionStatus: any;
  onUpgrade: () => void;
}

const SubscriptionPrompt: React.FC<SubscriptionPromptProps> = ({
  feature,
  subscriptionStatus,
  onUpgrade
}) => {
  const getFeatureInfo = (feature: string) => {
    const featureMap = {
      'NEW_PATIENT': {
        title: 'Add New Patients',
        description: 'Create and manage patient profiles in your practice',
        icon: <Crown className="h-5 w-5" />
      },
      'CREATE_PRESCRIPTION': {
        title: 'Create Prescriptions',
        description: 'Generate digital prescriptions for your patients',
        icon: <Crown className="h-5 w-5" />
      },
      'SEND_REMINDER': {
        title: 'Send Reminders',
        description: 'Send SMS and WhatsApp reminders to patients',
        icon: <Crown className="h-5 w-5" />
      }
    };

    return featureMap[feature as keyof typeof featureMap] || {
      title: 'Premium Feature',
      description: 'This feature requires an active subscription',
      icon: <Lock className="h-5 w-5" />
    };
  };

  const featureInfo = getFeatureInfo(feature);

  const getStatusMessage = () => {
    switch (subscriptionStatus.status) {
      case 'EXPIRED':
        return {
          message: 'Your subscription has expired',
          color: 'destructive' as const,
          icon: <AlertCircle className="h-4 w-4" />,
          action: 'Renew Subscription'
        };
      case 'CANCELLED':
        return {
          message: 'Your subscription was cancelled',
          color: 'secondary' as const,
          icon: <AlertCircle className="h-4 w-4" />,
          action: 'Subscribe Now'
        };
      case 'GRACE_PERIOD':
        return {
          message: `Grace period: ${subscriptionStatus.daysUntilExpiry || 0} days left`,
          color: 'warning' as const,
          icon: <Clock className="h-4 w-4" />,
          action: 'Renew Now'
        };
      default:
        return {
          message: 'Subscription required',
          color: 'secondary' as const,
          icon: <Lock className="h-4 w-4" />,
          action: 'Subscribe Now'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          {featureInfo.icon}
        </div>
        <CardTitle className="text-lg">{featureInfo.title}</CardTitle>
        <CardDescription>{featureInfo.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center space-x-2">
          {statusInfo.icon}
          <Badge variant={statusInfo.color}>
            {statusInfo.message}
          </Badge>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Unlock this feature with a subscription
          </p>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Unlimited patients</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Digital prescriptions</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>SMS & WhatsApp reminders</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={onUpgrade}
          className="w-full"
          size="lg"
        >
          {statusInfo.action}
        </Button>

        <p className="text-xs text-center text-gray-500">
          Starting from ₹99/month • Cancel anytime
        </p>
      </CardContent>
    </Card>
  );
};

// Inline subscription gate for smaller UI elements
export const InlineSubscriptionGate: React.FC<{
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ feature, children, fallback }) => {
  const { hasFeatureAccess } = useSubscription();

  if (hasFeatureAccess(feature)) {
    return <>{children}</>;
  }

  return fallback || (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Badge variant="secondary" className="text-xs">
          <Lock className="h-3 w-3 mr-1" />
          Premium
        </Badge>
      </div>
    </div>
  );
};

// Subscription status indicator
export const SubscriptionStatusIndicator: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  const { subscriptionStatus, redirectToSubscription } = useSubscription();

  if (!subscriptionStatus) return null;

  const getStatusColor = () => {
    switch (subscriptionStatus.status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'GRACE_PERIOD':
        return 'bg-yellow-500';
      case 'EXPIRED':
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (subscriptionStatus.status) {
      case 'ACTIVE':
        return 'Premium Active';
      case 'GRACE_PERIOD':
        return 'Grace Period';
      case 'EXPIRED':
        return 'Expired';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return 'Free Plan';
    }
  };

  const getStatusBadgeVariant = () => {
    switch (subscriptionStatus.status) {
      case 'ACTIVE':
        return 'default';
      case 'GRACE_PERIOD':
        return 'secondary';
      case 'EXPIRED':
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const showUpgradeButton = !subscriptionStatus.isActive;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      <Badge variant={getStatusBadgeVariant()} className="text-xs">
        {getStatusText()}
        {subscriptionStatus.daysUntilExpiry !== undefined && subscriptionStatus.daysUntilExpiry > 0 && (
          <span className="ml-1">
            ({subscriptionStatus.daysUntilExpiry}d)
          </span>
        )}
      </Badge>
      {showUpgradeButton && (
        <Button
          onClick={redirectToSubscription}
          variant="outline"
          size="sm"
          className="text-xs px-2 py-1 h-6"
        >
          Upgrade
        </Button>
      )}
    </div>
  );
};

// Detailed subscription status for dashboard
export const DetailedSubscriptionStatus: React.FC = () => {
  const { subscriptionStatus, redirectToSubscription } = useSubscription();

  if (!subscriptionStatus) return null;

  const getPlanInfo = () => {
    if (subscriptionStatus.subscription) {
      return {
        name: subscriptionStatus.subscription.planName?.includes('Monthly') ? 'Monthly Plan' : 'Yearly Plan',
        price: subscriptionStatus.subscription.displayPrice,
        nextBilling: subscriptionStatus.subscription.endDate ? 
          new Date(subscriptionStatus.subscription.endDate).toLocaleDateString() : null
      };
    }
    return null;
  };

  const planInfo = getPlanInfo();

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="h-5 w-5 text-blue-600" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">
                  {planInfo ? planInfo.name : 'Free Plan'}
                </h3>
                <SubscriptionStatusIndicator />
              </div>
              {planInfo && (
                <div className="text-sm text-gray-600">
                  {planInfo.price}
                  {planInfo.nextBilling && (
                    <span className="ml-2">• Next billing: {planInfo.nextBilling}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <Button
            onClick={redirectToSubscription}
            variant={subscriptionStatus.isActive ? "outline" : "default"}
            size="sm"
          >
            {subscriptionStatus.isActive ? "Manage" : "Upgrade"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};