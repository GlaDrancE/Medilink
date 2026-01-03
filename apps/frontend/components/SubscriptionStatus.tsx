'use client';

import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Zap,
  Download,
  CreditCard,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

interface FeatureUsage {
  feature: string;
  used: number;
  limit: number;
  percentage: number;
}

export const SubscriptionStatus: React.FC = () => {
  const { subscriptionStatus, refreshSubscriptionStatus } = useSubscription();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [featureUsage] = useState<FeatureUsage[]>([
    { feature: 'Patients Added', used: 23, limit: 50, percentage: 46 },
    { feature: 'Prescriptions Created', used: 87, limit: 100, percentage: 87 },
    { feature: 'Reminders Sent', used: 12, limit: 20, percentage: 60 }
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshSubscriptionStatus();
    setIsRefreshing(false);
  };

  const getStatusIcon = () => {
    if (!subscriptionStatus) return <Clock className="h-6 w-6 text-gray-500" />;
    
    switch (subscriptionStatus.status) {
      case 'ACTIVE':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'EXPIRED':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'GRACE_PERIOD':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'CANCELLED':
        return <AlertCircle className="h-6 w-6 text-orange-500" />;
      default:
        return <Crown className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    if (!subscriptionStatus) return 'Loading subscription status...';
    
    switch (subscriptionStatus.status) {
      case 'ACTIVE':
        return `Your ${subscriptionStatus.subscription?.planName} is active and running smoothly`;
      case 'EXPIRED':
        return 'Your subscription has expired. Renew to continue using premium features';
      case 'GRACE_PERIOD':
        return `You're in a grace period. ${subscriptionStatus.daysUntilExpiry} days left to renew`;
      case 'CANCELLED':
        return 'Your subscription is cancelled but active until the end of the billing period';
      case 'INACTIVE':
        return 'You don\'t have an active subscription. Subscribe to unlock premium features';
      default:
        return 'Unable to determine subscription status';
    }
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon()}
              <span>Subscription Status</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {subscriptionStatus && (
                <Badge 
                  variant={subscriptionStatus.isActive ? 'default' : 'secondary'}
                  className="text-sm"
                >
                  {subscriptionStatus.status.replace('_', ' ')}
                </Badge>
              )}
              <p className="text-gray-700">{getStatusMessage()}</p>
            </div>

            {/* Subscription Details */}
            {subscriptionStatus?.subscription && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Plan</p>
                    <p className="font-medium">{subscriptionStatus.subscription.planName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Price</p>
                    <p className="font-medium">{subscriptionStatus.subscription.displayPrice}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Renewal</p>
                    <p className="font-medium">{subscriptionStatus.subscription.endDate}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Expiry Warning */}
            {subscriptionStatus?.isActive && subscriptionStatus.daysUntilExpiry !== undefined && subscriptionStatus.daysUntilExpiry <= 7 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Renewal Reminder</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Your subscription expires in {subscriptionStatus.daysUntilExpiry} days. 
                  Renew now to avoid service interruption.
                </p>
                <Button size="sm" className="mt-3">
                  Renew Now
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feature Usage */}
      {subscriptionStatus?.isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Feature Usage</span>
            </CardTitle>
            <CardDescription>
              Track your usage of premium features this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featureUsage.map((usage, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{usage.feature}</span>
                    <span className="text-gray-600">
                      {usage.used} / {usage.limit === -1 ? '∞' : usage.limit}
                    </span>
                  </div>
                  
                  {usage.limit !== -1 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(usage.percentage)}`}
                        style={{ width: `${Math.min(usage.percentage, 100)}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {usage.percentage >= 90 && usage.limit !== -1 && (
                    <p className="text-xs text-red-600">
                      You're approaching your monthly limit
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-800 mb-2">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Upgrade for More</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Need higher limits? Upgrade to our Yearly plan for unlimited usage.
              </p>
              <Button size="sm" variant="outline" className="text-blue-600 border-blue-300">
                View Upgrade Options
                <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
            
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
            
            <Button variant="outline" className="justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment Method
            </Button>
            
            <Button variant="outline" className="justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              View Billing Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};