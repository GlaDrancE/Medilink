'use client';

import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import { subscriptionApi, paymentApi, handleSubscriptionError } from '@/services/subscription.api';
import { SubscriptionAnalytics } from '@/components/SubscriptionAnalytics';
import { SubscriptionSettings } from '@/components/SubscriptionSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CreditCard, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Crown,
  TrendingUp,
  FileText,
  Settings,
  RefreshCw,
  BarChart3
} from 'lucide-react';

interface PaymentHistory {
  id: string;
  razorpayPaymentId: string;
  amount: number;
  displayAmount: string;
  currency: string;
  status: string;
  paymentMethod?: string;
  createdAt: string;
  subscription?: {
    id: string;
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
  };
}

interface PaymentStats {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  totalRevenue: number;
  displayTotalRevenue: string;
  averageOrderValue: number;
  displayAverageOrderValue: string;
  successRate: number;
}

type TabType = 'overview' | 'analytics' | 'settings';

export const SubscriptionManagement: React.FC = () => {
  const { subscriptionStatus, refreshSubscriptionStatus } = useSubscription();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [historyResponse, statsResponse, subscriptionHistoryResponse] = await Promise.all([
        paymentApi.getHistory().catch(() => ({ success: false, data: { payments: [] } })),
        paymentApi.getStatistics().catch(() => ({ success: false, data: null })),
        subscriptionApi.getHistory().catch(() => ({ success: false, data: { subscriptions: [] } }))
      ]);

      if (historyResponse.success) {
        setPaymentHistory(historyResponse.data.payments || []);
      }

      if (statsResponse.success && statsResponse.data) {
        setPaymentStats(statsResponse.data);
      }

      if (subscriptionHistoryResponse.success) {
        setSubscriptionHistory(subscriptionHistoryResponse.data.subscriptions || []);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      const errorInfo = handleSubscriptionError(error);
      setError(errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadData(),
      refreshSubscriptionStatus()
    ]);
    setIsRefreshing(false);
  };

  const handleCancelSubscription = async () => {
    try {
      const result = await subscriptionApi.cancel();
      if (result.success) {
        alert('Subscription cancelled successfully');
        await refreshSubscriptionStatus();
      } else {
        alert(result.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      const errorInfo = handleSubscriptionError(error);
      alert(errorInfo.message);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'CANCELLED': return 'destructive';
      case 'EXPIRED': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'captured': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <SubscriptionAnalytics />;
      case 'settings':
        return <SubscriptionSettings />;
      case 'overview':
      default:
        return renderOverviewContent();
    }
  };

  const renderOverviewContent = () => (
    <>
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5" />
            <span>Current Subscription</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptionStatus ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant={getStatusBadgeVariant(subscriptionStatus.status)}>
                    {subscriptionStatus.status.replace('_', ' ')}
                  </Badge>
                  {subscriptionStatus.subscription && (
                    <span className="text-sm text-gray-600">
                      {subscriptionStatus.subscription.planName}
                    </span>
                  )}
                </div>
                
                {subscriptionStatus.subscription && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">
                        {subscriptionStatus.subscription.displayPrice}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Started:</span>
                      <span>{new Date(subscriptionStatus.subscription.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next billing:</span>
                      <span>{new Date(subscriptionStatus.subscription.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Update Payment Method
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Change Plan
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-600 mb-4">Subscribe to unlock all premium features</p>
              <Button>
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Statistics */}
      {paymentStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Payment Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{paymentStats.successfulPayments}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{paymentStats.failedPayments}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{paymentStats.displayTotalRevenue}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{paymentStats.successRate}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Recent Payments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentHistory.length > 0 ? (
            <div className="space-y-3">
              {paymentHistory.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      payment.status === 'captured' ? 'bg-green-500' : 
                      payment.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">{payment.displayAmount}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={payment.status === 'captured' ? 'default' : 'secondary'}>
                      {payment.status}
                    </Badge>
                    {payment.paymentMethod && (
                      <div className="text-xs text-gray-500 mt-1">{payment.paymentMethod}</div>
                    )}
                  </div>
                </div>
              ))}
              
              {paymentHistory.length > 5 && (
                <Button variant="outline" className="w-full">
                  View All Payments ({paymentHistory.length})
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
              <p className="text-gray-600">Your payment history will appear here once you make a payment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600">Manage your subscription and view payment history</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Crown className="h-4 w-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="h-4 w-4 inline mr-2" />
            Settings
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};