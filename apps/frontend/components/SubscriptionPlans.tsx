'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Crown, 
  Star, 
  Zap, 
  Users, 
  FileText, 
  MessageSquare, 
  Headphones,
  BarChart3,
  Layers,
  Clock,
  Shield
} from 'lucide-react';

interface SubscriptionPlansProps {
  onSelectPlan: (plan: 'MONTHLY' | 'YEARLY') => void;
  currentPlan?: 'MONTHLY' | 'YEARLY' | null;
  isLoading?: boolean;
  showComparison?: boolean;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onSelectPlan,
  currentPlan,
  isLoading = false,
  showComparison = true
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  const plans = [
    {
      id: 'MONTHLY' as const,
      name: 'Monthly Plan',
      price: 99,
      displayPrice: '₹99',
      period: 'per month',
      description: 'Perfect for getting started with all essential features',
      popular: false,
      savings: null,
      features: [
        { icon: <Users className="h-4 w-4" />, text: 'Unlimited patients' },
        { icon: <FileText className="h-4 w-4" />, text: 'Digital prescriptions' },
        { icon: <MessageSquare className="h-4 w-4" />, text: 'SMS & WhatsApp reminders' },
        { icon: <Headphones className="h-4 w-4" />, text: 'Basic support' }
      ],
      limits: {
        patients: 'Unlimited',
        prescriptions: '100/day',
        reminders: '20/day',
        support: 'Email support'
      }
    },
    {
      id: 'YEARLY' as const,
      name: 'Yearly Plan',
      price: 999,
      displayPrice: '₹999',
      period: 'per year',
      description: 'Best value with all features and priority support',
      popular: true,
      savings: 'Save ₹189 (2 months free)',
      features: [
        { icon: <Users className="h-4 w-4" />, text: 'Everything in Monthly' },
        { icon: <Headphones className="h-4 w-4" />, text: 'Priority support' },
        { icon: <BarChart3 className="h-4 w-4" />, text: 'Advanced analytics' },
        { icon: <Layers className="h-4 w-4" />, text: 'Bulk operations' },
        { icon: <Crown className="h-4 w-4" />, text: '2 months free' }
      ],
      limits: {
        patients: 'Unlimited',
        prescriptions: 'Unlimited',
        reminders: '50/day',
        support: 'Priority phone & email'
      }
    }
  ];

  const handleSelectPlan = (planId: 'MONTHLY' | 'YEARLY') => {
    setSelectedPlan(planId);
    onSelectPlan(planId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Unlock all premium features and grow your practice
        </p>
        
        {/* Billing Toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedPlan('MONTHLY')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPlan === 'MONTHLY'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPlan('YEARLY')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPlan === 'YEARLY'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Yearly</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              Save 16%
            </Badge>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative transition-all duration-200 ${
              plan.popular 
                ? 'border-blue-500 shadow-lg scale-105' 
                : selectedPlan === plan.id
                ? 'border-blue-300 shadow-md'
                : 'hover:shadow-md'
            } ${currentPlan === plan.id ? 'ring-2 ring-green-500' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            {currentPlan === plan.id && (
              <div className="absolute -top-3 right-4">
                <Badge className="bg-green-500 text-white px-3 py-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Current Plan
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                <Crown className="h-6 w-6 text-blue-600" />
                <span>{plan.name}</span>
              </CardTitle>
              <CardDescription className="text-base">
                {plan.description}
              </CardDescription>
              
              <div className="mt-6">
                <div className="flex items-baseline justify-center space-x-2">
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.displayPrice}
                  </span>
                  <span className="text-gray-600 text-lg">{plan.period}</span>
                </div>
                
                {plan.savings && (
                  <Badge variant="secondary" className="mt-3">
                    {plan.savings}
                  </Badge>
                )}

                {plan.id === 'YEARLY' && (
                  <p className="text-sm text-gray-500 mt-2">
                    That's just ₹83/month
                  </p>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Features List */}
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="text-green-500">
                      {feature.icon}
                    </div>
                    <span className="text-sm font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Usage Limits */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-sm mb-3 text-gray-700">Usage Limits</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Patients:</span>
                    <span className="ml-1 font-medium">{plan.limits.patients}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Prescriptions:</span>
                    <span className="ml-1 font-medium">{plan.limits.prescriptions}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Reminders:</span>
                    <span className="ml-1 font-medium">{plan.limits.reminders}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Support:</span>
                    <span className="ml-1 font-medium">{plan.limits.support}</span>
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <Button
                onClick={() => handleSelectPlan(plan.id)}
                className="w-full"
                size="lg"
                disabled={isLoading || currentPlan === plan.id}
                variant={plan.popular ? 'default' : 'outline'}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : currentPlan === plan.id ? (
                  'Current Plan'
                ) : currentPlan ? (
                  'Switch to This Plan'
                ) : (
                  'Get Started'
                )}
              </Button>

              {plan.id === 'YEARLY' && !currentPlan && (
                <p className="text-center text-xs text-gray-500 mt-2">
                  Most popular choice among doctors
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison Table */}
      {showComparison && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Feature Comparison</CardTitle>
            <CardDescription className="text-center">
              See what's included in each plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Features</th>
                    <th className="text-center py-3 px-4 font-medium">Monthly</th>
                    <th className="text-center py-3 px-4 font-medium">Yearly</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-3 px-4">Patient Management</td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Digital Prescriptions</td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">SMS & WhatsApp Reminders</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-sm text-gray-600">20/day</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-sm text-gray-600">50/day</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Priority Support</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-sm text-gray-400">—</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Advanced Analytics</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-sm text-gray-400">—</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Bulk Operations</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-sm text-gray-400">—</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trust Indicators */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2">Secure Payments</h3>
          <p className="text-sm text-gray-600">
            256-bit SSL encryption with Razorpay
          </p>
        </div>
        
        <div className="text-center">
          <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <Clock className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold mb-2">Cancel Anytime</h3>
          <p className="text-sm text-gray-600">
            No long-term commitments or hidden fees
          </p>
        </div>
        
        <div className="text-center">
          <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-2">Instant Activation</h3>
          <p className="text-sm text-gray-600">
            Start using all features immediately
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Can I change my plan later?</h4>
              <p className="text-sm text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time from your account settings.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">What payment methods do you accept?</h4>
              <p className="text-sm text-gray-600">
                We accept all major credit/debit cards, UPI, net banking, and digital wallets through Razorpay.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Is there a free trial?</h4>
              <p className="text-sm text-gray-600">
                You can view existing data for free. Premium features require a subscription to unlock.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">What happens if I cancel?</h4>
              <p className="text-sm text-gray-600">
                You'll retain access to premium features until your current billing period ends.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};