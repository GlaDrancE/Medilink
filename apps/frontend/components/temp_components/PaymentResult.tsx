'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  CreditCard, 
  Download, 
  Home, 
  RefreshCw,
  AlertTriangle,
  Crown,
  Calendar
} from 'lucide-react';

interface PaymentResultProps {
  type: 'success' | 'failure' | 'pending';
  paymentId?: string;
  subscriptionId?: string;
  amount?: string;
  plan?: 'MONTHLY' | 'YEARLY';
  error?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  onDownloadReceipt?: () => void;
}

export const PaymentResult: React.FC<PaymentResultProps> = ({
  type,
  paymentId,
  subscriptionId,
  amount,
  plan,
  error,
  onRetry,
  onGoHome,
  onDownloadReceipt
}) => {
  const getResultConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: 'Payment Successful!',
          description: 'Your subscription has been activated successfully',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'failure':
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: 'Payment Failed',
          description: 'We couldn\'t process your payment. Please try again.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        };
      case 'pending':
        return {
          icon: <Clock className="h-16 w-16 text-yellow-500" />,
          title: 'Payment Pending',
          description: 'Your payment is being processed. This may take a few minutes.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      default:
        return {
          icon: <AlertTriangle className="h-16 w-16 text-gray-500" />,
          title: 'Unknown Status',
          description: 'Unable to determine payment status',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800'
        };
    }
  };

  const config = getResultConfig();

  const getPlanDetails = () => {
    if (!plan) return null;
    
    return {
      MONTHLY: {
        name: 'Monthly Plan',
        duration: '1 month',
        features: ['Unlimited patients', 'Digital prescriptions', 'SMS reminders', 'Basic support']
      },
      YEARLY: {
        name: 'Yearly Plan', 
        duration: '12 months',
        features: ['Everything in Monthly', 'Priority support', 'Advanced analytics', 'Bulk operations']
      }
    }[plan];
  };

  const planDetails = getPlanDetails();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Main Result Card */}
        <Card className={`${config.borderColor} ${config.bgColor}`}>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {config.icon}
              
              <div>
                <h1 className={`text-2xl font-bold ${config.textColor}`}>
                  {config.title}
                </h1>
                <p className={`mt-2 ${config.textColor} opacity-90`}>
                  {config.description}
                </p>
              </div>

              {/* Payment Details */}
              {(paymentId || amount) && (
                <div className="bg-white rounded-lg p-4 space-y-2">
                  {amount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{amount}</span>
                    </div>
                  )}
                  {paymentId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-mono text-xs">{paymentId}</span>
                    </div>
                  )}
                  {subscriptionId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subscription ID:</span>
                      <span className="font-mono text-xs">{subscriptionId}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Error Details */}
              {type === 'failure' && error && (
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-red-800">Error Details:</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Details (Success only) */}
        {type === 'success' && planDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-blue-600" />
                <span>Subscription Activated</span>
              </CardTitle>
              <CardDescription>
                Your {planDetails.name} is now active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Plan:</span>
                  <Badge variant="default">{planDetails.name}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="text-sm font-medium">{planDetails.duration}</span>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Features included:</p>
                  <div className="space-y-1">
                    {planDetails.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Next Billing</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    {plan === 'MONTHLY' 
                      ? 'Your next payment will be processed in 30 days'
                      : 'Your next payment will be processed in 12 months'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {type === 'success' && (
            <>
              {onDownloadReceipt && (
                <Button
                  onClick={onDownloadReceipt}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
              )}
              
              <Button
                onClick={onGoHome}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </>
          )}

          {type === 'failure' && (
            <>
              {onRetry && (
                <Button
                  onClick={onRetry}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              
              <Button
                onClick={onGoHome}
                variant="outline"
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </>
          )}

          {type === 'pending' && (
            <>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Status
              </Button>
              
              <Button
                onClick={onGoHome}
                variant="outline"
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </>
          )}
        </div>

        {/* Support Information */}
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Need help with your {type === 'success' ? 'subscription' : 'payment'}?
              </p>
              <div className="flex justify-center space-x-4 text-xs">
                <button className="text-blue-600 hover:underline">
                  Contact Support
                </button>
                <button className="text-blue-600 hover:underline">
                  View FAQ
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Reference */}
        {paymentId && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Transaction Reference: {paymentId}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Keep this reference for your records
            </p>
          </div>
        )}
      </div>
    </div>
  );
};