'use client';

import React, { useState, useEffect } from 'react';
import { subscriptionApi, paymentApi, handleSubscriptionError } from '@/services/subscription.api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Users, 
  CreditCard,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  subscriptionMetrics: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    monthlySubscriptions: number;
    yearlySubscriptions: number;
    churnRate: number;
    renewalRate: number;
  };
  paymentMetrics: {
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    totalRevenue: number;
    displayTotalRevenue: string;
    averageOrderValue: number;
    displayAverageOrderValue: string;
    successRate: number;
  };
  usageMetrics: {
    patientsAdded: number;
    prescriptionsCreated: number;
    remindersSent: number;
    activeFeatures: string[];
  };
}

export const SubscriptionAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, this would call the API
      // For now, we'll simulate with mock data
      const mockAnalytics: AnalyticsData = {
        subscriptionMetrics: {
          totalSubscriptions: 1,
          activeSubscriptions: 1,
          monthlySubscriptions: 1,
          yearlySubscriptions: 0,
          churnRate: 0,
          renewalRate: 100
        },
        paymentMetrics: {
          totalPayments: 1,
          successfulPayments: 1,
          failedPayments: 0,
          totalRevenue: 99,
          displayTotalRevenue: '₹99',
          averageOrderValue: 99,
          displayAverageOrderValue: '₹99',
          successRate: 100
        },
        usageMetrics: {
          patientsAdded: 12,
          prescriptionsCreated: 45,
          remindersSent: 23,
          activeFeatures: ['NEW_PATIENT', 'CREATE_PRESCRIPTION', 'SEND_REMINDER']
        }
      };

      setAnalyticsData(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      const errorInfo = handleSubscriptionError(error);
      setError(errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAnalytics();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Analytics</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) return null;

  const { subscriptionMetrics, paymentMetrics, usageMetrics } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your subscription and usage metrics</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Time Range Selector */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {[{ key: '7d', label: '7D' }, { key: '30d', label: '30D' }, { key: '90d', label: '90D' }, { key: '1y', label: '1Y' }].map((range) => (
              <button
                key={range.key}
                onClick={() => setTimeRange(range.key as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{paymentMetrics.displayTotalRevenue}</p>
              </div>
              <div className="bg-green-100 rounded-full p-2">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-600">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold">{subscriptionMetrics.activeSubscriptions}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-600">+5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payment Success Rate</p>
                <p className="text-2xl font-bold">{paymentMetrics.successRate}%</p>
              </div>
              <div className="bg-purple-100 rounded-full p-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-600">+2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Order Value</p>
                <p className="text-2xl font-bold">{paymentMetrics.displayAverageOrderValue}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              <span className="text-red-600">-3% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Feature Usage</span>
          </CardTitle>
          <CardDescription>
            Track how you're using premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Patients Added</span>
              </div>
              <span className="text-sm font-medium">{usageMetrics.patientsAdded}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-green-500" />
                <span className="text-sm">Prescriptions Created</span>
              </div>
              <span className="text-sm font-medium">{usageMetrics.prescriptionsCreated}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Reminders Sent</span>
              </div>
              <span className="text-sm font-medium">{usageMetrics.remindersSent}</span>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Active Features:</p>
              <div className="flex flex-wrap gap-1">
                {usageMetrics.activeFeatures.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Great Usage Pattern!</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    You're actively using all premium features. Consider upgrading to yearly plan to save ₹189.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Excellent Payment History</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your payment success rate is {paymentMetrics.successRate}%. Keep up the good work!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};