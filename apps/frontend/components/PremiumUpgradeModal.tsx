'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, X, CheckCircle, ArrowRight } from 'lucide-react';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  onUpgrade: () => void;
}

export const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  featureName,
  onUpgrade
}) => {
  if (!isOpen) return null;

  const featureDetails = {
    'NEW_PATIENT': {
      title: 'Add New Patient',
      description: 'Create and manage unlimited patient profiles',
      icon: '👥'
    },
    'CREATE_PRESCRIPTION': {
      title: 'Create Prescription',
      description: 'Generate digital prescriptions with ease',
      icon: '📝'
    },
    'SEND_REMINDER': {
      title: 'Send Reminder',
      description: 'Send SMS and WhatsApp reminders to patients',
      icon: '📨'
    }
  };

  const feature = featureDetails[featureName as keyof typeof featureDetails] || {
    title: 'Premium Feature',
    description: 'This feature requires a premium subscription',
    icon: '⭐'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="relative text-center">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Premium Feature
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-4xl mb-3">{feature.icon}</div>
            <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
            <CardDescription className="text-gray-600">
              {feature.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Feature Benefits */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-gray-800">What you'll get with Premium:</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Unlimited patient records</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Digital prescription generation</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>SMS & WhatsApp reminders</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Advanced analytics</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">₹99</div>
                  <div className="text-sm text-gray-500">per month</div>
                </div>
                <div className="text-gray-400">or</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">₹999</div>
                  <div className="text-sm text-gray-500">per year</div>
                  <Badge variant="secondary" className="text-xs mt-1">Save 2 months</Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onUpgrade}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Maybe Later
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="text-center text-xs text-gray-500">
              <p>✓ Cancel anytime • ✓ Secure payment • ✓ 30-day money back</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};