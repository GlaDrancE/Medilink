'use client';

import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import { subscriptionApi, handleSubscriptionError } from '@/services/subscription.api';
import { NotificationPreferences } from '@/components/NotificationPreferences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  CreditCard, 
  Bell, 
  Shield, 
  Download, 
  Trash2,
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Mail,
  Phone,
  User
} from 'lucide-react';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  expiryReminders: boolean;
  paymentReceipts: boolean;
  featureUpdates: boolean;
}

interface BillingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export const SubscriptionSettings: React.FC = () => {
  const { subscriptionStatus, refreshSubscriptionStatus } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    expiryReminders: true,
    paymentReceipts: true,
    featureUpdates: false
  });
  
  // Billing information
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    name: 'Dr. John Doe',
    email: 'doctor@example.com',
    phone: '9876543210',
    address: '123 Medical Street, City, State 12345'
  });
  
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [tempBillingInfo, setTempBillingInfo] = useState<BillingInfo>(billingInfo);

  useEffect(() => {
    // Load settings from API or localStorage
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // In a real implementation, load settings from API
      const savedNotifications = localStorage.getItem('notificationSettings');
      const savedBillingInfo = localStorage.getItem('billingInfo');
      
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
      
      if (savedBillingInfo) {
        const billing = JSON.parse(savedBillingInfo);
        setBillingInfo(billing);
        setTempBillingInfo(billing);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, save to API
      localStorage.setItem('notificationSettings', JSON.stringify(notifications));
      
      setSuccess('Notification settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setError('Failed to save notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveBillingInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate billing info
      if (!tempBillingInfo.name.trim() || !tempBillingInfo.email.trim()) {
        setError('Name and email are required');
        return;
      }
      
      // In a real implementation, save to API
      localStorage.setItem('billingInfo', JSON.stringify(tempBillingInfo));
      
      setBillingInfo(tempBillingInfo);
      setIsEditingBilling(false);
      setSuccess('Billing information updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving billing info:', error);
      setError('Failed to save billing information');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBillingEdit = () => {
    setTempBillingInfo(billingInfo);
    setIsEditingBilling(false);
    setError(null);
  };

  const handleCancelSubscription = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period.'
    );
    
    if (!confirmed) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await subscriptionApi.cancelSubscription();
      
      if (result.success) {
        setSuccess('Subscription cancelled successfully. You will retain access until the end of your billing period.');
        await refreshSubscriptionStatus();
      } else {
        setError(result.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      const errorInfo = handleSubscriptionError(error);
      setError(errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, this would download the latest invoice
      setSuccess('Invoice download started');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setError('Failed to download invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Auto-save notification preferences
    setTimeout(() => {
      saveNotificationSettings();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Subscription Settings</h2>
        <p className="text-gray-600">Manage your subscription preferences and billing information</p>
      </div>

      {/* Status Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-green-800">{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Current Subscription</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptionStatus?.isActive ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium">
                      {subscriptionStatus.plan === 'MONTHLY' ? 'Monthly Plan' : 'Yearly Plan'}
                    </h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <p className="text-gray-600">
                    {subscriptionStatus.plan === 'MONTHLY' ? '₹99/month' : '₹999/year'}
                  </p>
                  {subscriptionStatus.expiresAt && (
                    <p className="text-sm text-gray-500">
                      Next billing: {new Date(subscriptionStatus.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Change Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-600 mb-4">Subscribe to unlock all premium features</p>
              <Button>
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Billing Information</span>
              </CardTitle>
              <CardDescription>
                Update your billing details and payment method
              </CardDescription>
            </div>
            {!isEditingBilling && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditingBilling(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={isEditingBilling ? tempBillingInfo.name : billingInfo.name}
                  onChange={(e) => setTempBillingInfo(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditingBilling}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={isEditingBilling ? tempBillingInfo.email : billingInfo.email}
                  onChange={(e) => setTempBillingInfo(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditingBilling}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={isEditingBilling ? tempBillingInfo.phone : billingInfo.phone}
                  onChange={(e) => setTempBillingInfo(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditingBilling}
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={isEditingBilling ? tempBillingInfo.address : billingInfo.address}
                  onChange={(e) => setTempBillingInfo(prev => ({ ...prev, address: e.target.value }))}
                  disabled={!isEditingBilling}
                />
              </div>
            </div>
          </div>

          {isEditingBilling && (
            <div className="flex space-x-3 mt-6">
              <Button 
                onClick={saveBillingInfo}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button 
                variant="outline"
                onClick={cancelBillingEdit}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <NotificationPreferences />

      {/* Security & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security & Privacy</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <Button variant="outline" size="sm">
                Enable 2FA
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Data Export</p>
                <p className="text-sm text-gray-600">Download your subscription and payment data</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Account Deletion</p>
                <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
              </div>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Billing & Invoices</CardTitle>
          <CardDescription>
            Access your billing history and download invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleDownloadInvoice}>
              <Download className="h-4 w-4 mr-2" />
              Download Latest Invoice
            </Button>
            
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              View Billing History
            </Button>
            
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {subscriptionStatus?.isActive && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Danger Zone</span>
            </CardTitle>
            <CardDescription className="text-red-600">
              These actions cannot be undone. Please proceed with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-800">Cancel Subscription</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Once you cancel, you'll lose access to all premium features at the end of your current billing period.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 text-red-600 border-red-300 hover:bg-red-100"
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                  >
                    Cancel My Subscription
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};