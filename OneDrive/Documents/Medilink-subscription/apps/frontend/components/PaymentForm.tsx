'use client';

import React, { useState, useEffect } from 'react';
import { paymentApi, handleSubscriptionError } from '@/services/subscription.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Input from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, CreditCard, Shield, Clock, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentFormProps {
  plan: 'MONTHLY' | 'YEARLY';
  onSuccess?: (subscriptionId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  plan,
  onSuccess,
  onError,
  onCancel,
  customerInfo: initialCustomerInfo
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: initialCustomerInfo?.name || '',
    email: initialCustomerInfo?.email || '',
    phone: initialCustomerInfo?.phone || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      if (window.Razorpay) {
        setIsRazorpayLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setIsRazorpayLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        onError?.('Failed to load payment gateway. Please refresh and try again.');
      };
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    };

    loadRazorpay();
  }, [onError]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (customerInfo.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(customerInfo.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    if (!isRazorpayLoaded) {
      onError?.('Payment gateway is still loading. Please try again.');
      return;
    }

    try {
      setIsLoading(true);

      // Create payment order
      const orderResponse = await paymentApi.createOrder(plan, customerInfo);

      if (!orderResponse.success) {
        throw new Error('Failed to create payment order');
      }

      const { orderId, amount, currency, keyId } = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'MediLink',
        description: `${plan} Subscription - ${plan === 'MONTHLY' ? '₹99/month' : '₹999/year'}`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            setIsLoading(true);
            
            // Verify payment
            const verifyResponse = await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.success) {
              onSuccess?.(verifyResponse.data.subscriptionId);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            const errorInfo = handleSubscriptionError(error);
            onError?.(errorInfo.message);
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            onCancel?.();
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      const errorInfo = handleSubscriptionError(error);
      onError?.(errorInfo.message);
      setIsLoading(false);
    }
  };

  const planDetails = {
    MONTHLY: {
      name: 'Monthly Plan',
      price: '₹99',
      period: 'per month',
      savings: null,
      features: [
        'Unlimited patients',
        'Digital prescriptions',
        'SMS & WhatsApp reminders',
        'Basic support'
      ]
    },
    YEARLY: {
      name: 'Yearly Plan',
      price: '₹999',
      period: 'per year',
      savings: 'Save ₹189 (2 months free)',
      features: [
        'Everything in Monthly',
        'Priority support',
        'Advanced analytics',
        'Bulk operations',
        '2 months free'
      ]
    }
  };

  const selectedPlan = planDetails[plan];

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Complete Your Subscription</span>
          </CardTitle>
          <CardDescription>
            Subscribe to {selectedPlan.name} and unlock all features
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Plan Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{selectedPlan.name}</h3>
              <Badge variant="default">{plan}</Badge>
            </div>
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-2xl font-bold">{selectedPlan.price}</span>
              <span className="text-gray-600">{selectedPlan.period}</span>
            </div>
            {selectedPlan.savings && (
              <Badge variant="secondary" className="text-xs">
                {selectedPlan.savings}
              </Badge>
            )}
            
            <div className="mt-3 space-y-1">
              {selectedPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Information Form */}
          <div className="space-y-4">
            <h4 className="font-medium">Billing Information</h4>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Dr. John Doe"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@example.com"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-blue-800">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Your payment is secured by Razorpay with 256-bit SSL encryption
            </p>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            className="w-full"
            size="lg"
            disabled={isLoading || !isRazorpayLoaded}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : !isRazorpayLoaded ? (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Loading Payment Gateway...</span>
              </div>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay {selectedPlan.price} - Subscribe Now
              </>
            )}
          </Button>

          {/* Cancel Button */}
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center">
            By subscribing, you agree to our Terms of Service and Privacy Policy. 
            You can cancel anytime from your account settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};