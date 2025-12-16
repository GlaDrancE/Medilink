'use client';

import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import { subscriptionApi, paymentApi, handleSubscriptionError } from '@/services/subscription.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Zap, Clock, Star } from 'lucide-react';


declare global {
  interface Window {
    Razorpay: any;
  }
}

export const SubscriptionPage: React.FC = () => {
  const { subscriptionStatus, refreshSubscriptionStatus } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<'MONTHLY' | 'YEARLY' | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');


  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = async (plan: 'MONTHLY' | 'YEARLY') => {
    try {
      setLoadingPlan(plan);

      // Razorpay integration flow
      const orderResponse = await paymentApi.createOrder(plan, {
        name: 'Dr. John Doe', // This should come from user context
        email: 'doctor@example.com', // This should come from user context
        phone: '9876543210' // This should come from user context
      });

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
        description: `${plan} Subscription`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.success) {
              alert('Subscription activated successfully!');
              await refreshSubscriptionStatus();
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: 'Dr. John Doe',
          email: 'doctor@example.com',
          contact: '9876543210'
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setLoadingPlan(null);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Subscription error:', error);
      const errorInfo = handleSubscriptionError(error);
      alert(errorInfo.message);
    } finally {
      setLoadingPlan(null);
    }
  };



  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      setLoadingPlan('MONTHLY'); // Use any plan for cancel loading
      const response = await subscriptionApi.cancel();
      
      if (response.success) {
        alert('Subscription cancelled successfully');
        await refreshSubscriptionStatus();
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      const errorInfo = handleSubscriptionError(error);
      alert(errorInfo.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      id: 'MONTHLY' as const,
      name: 'Monthly Plan',
      price: '₹99',
      period: 'per month',
      description: 'Perfect for getting started',
      features: [
        'Unlimited patients',
        'Digital prescriptions',
        'SMS & WhatsApp reminders',
        'Basic support'
      ],
      popular: false
    },
    {
      id: 'YEARLY' as const,
      name: 'Yearly Plan',
      price: '₹999',
      period: 'per year',
      description: 'Best value with all features',
      savings: 'Save ₹189',
      features: [
        'Everything in Monthly',
        'Priority support',
        'Advanced analytics',
        'Bulk operations',
        '2 months free'
      ],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Unlock all premium features and grow your practice
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscriptionStatus && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5" />
                <span>Current Subscription</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant={subscriptionStatus.isActive ? 'default' : 'secondary'}>
                      {subscriptionStatus.status}
                    </Badge>
                    {subscriptionStatus.subscription && (
                      <span className="text-sm text-gray-600">
                        {subscriptionStatus.subscription.planName}
                      </span>
                    )}
                  </div>
                  {subscriptionStatus.subscription && (
                    <p className="text-sm text-gray-600">
                      {subscriptionStatus.isActive 
                        ? `Expires on ${subscriptionStatus.subscription.endDate}`
                        : 'No active subscription'
                      }
                    </p>
                  )}
                </div>
                {subscriptionStatus.isActive && (
                  <Button
                    onClick={handleCancelSubscription}
                    variant="outline"
                    disabled={loadingPlan !== null}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
                {plan.savings && (
                  <Badge variant="secondary" className="mt-2">
                    {plan.savings}
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  className="w-full"
                  size="lg"
                  disabled={loadingPlan === plan.id}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {loadingPlan === plan.id ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      {subscriptionStatus?.isActive ? 'Switch Plan' : 'Subscribe Now'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">What's Included</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Patient Management</h3>
                <p className="text-sm text-gray-600">
                  Add unlimited patients and manage their profiles
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Digital Prescriptions</h3>
                <p className="text-sm text-gray-600">
                  Create and manage digital prescriptions easily
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Smart Reminders</h3>
                <p className="text-sm text-gray-600">
                  Send SMS and WhatsApp reminders to patients
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ or Support */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Need help choosing a plan? Contact our support team.
          </p>
          <Button variant="outline">
            Contact Support
          </Button>
        </div>
      </div>


    </div>
  );
};