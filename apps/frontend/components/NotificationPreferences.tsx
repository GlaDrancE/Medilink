'use client';

import React, { useState, useEffect } from 'react';
import { notificationApi, handleNotificationError } from '@/services/notification.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react';

interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  expiryReminders: boolean;
  paymentReceipts: boolean;
  featureUpdates: boolean;
}

export const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    smsNotifications: true,
    expiryReminders: true,
    paymentReceipts: true,
    featureUpdates: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPreferences, setOriginalPreferences] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await notificationApi.getNotificationPreferences();
      
      if (result.success && result.data) {
        setPreferences(result.data);
        setOriginalPreferences(result.data);
        setHasChanges(false);
      } else {
        setError(result.error || 'Failed to load notification preferences');
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      const errorInfo = handleNotificationError(error);
      setError(errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      const result = await notificationApi.updateNotificationPreferences(preferences);
      
      if (result.success) {
        setOriginalPreferences(preferences);
        setHasChanges(false);
        setSuccess('Notification preferences saved successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to save notification preferences');
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      const errorInfo = handleNotificationError(error);
      setError(errorInfo.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    // Check if there are changes
    if (originalPreferences) {
      const hasChanges = Object.keys(newPreferences).some(
        k => newPreferences[k as keyof NotificationPreferences] !== originalPreferences[k as keyof NotificationPreferences]
      );
      setHasChanges(hasChanges);
    }
  };

  const resetPreferences = () => {
    if (originalPreferences) {
      setPreferences(originalPreferences);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notification Preferences</span>
        </CardTitle>
        <CardDescription>
          Choose how you want to receive updates about your subscription and account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Messages */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-800 text-sm">{success}</span>
          </div>
        )}

        {/* Notification Settings */}
        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-600">
                  Receive important updates and notifications via email
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* SMS Notifications */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="font-medium">SMS Notifications</h4>
                <p className="text-sm text-gray-600">
                  Get urgent notifications and payment confirmations via SMS
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.smsNotifications}
                onChange={(e) => handlePreferenceChange('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Expiry Reminders */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <h4 className="font-medium">Subscription Expiry Reminders</h4>
                <p className="text-sm text-gray-600">
                  Get notified 7, 3, and 1 day before your subscription expires
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.expiryReminders}
                onChange={(e) => handlePreferenceChange('expiryReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Payment Receipts */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-purple-500" />
              <div>
                <h4 className="font-medium">Payment Receipts</h4>
                <p className="text-sm text-gray-600">
                  Receive email receipts for successful payments and renewals
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.paymentReceipts}
                onChange={(e) => handlePreferenceChange('paymentReceipts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Feature Updates */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <h4 className="font-medium">Feature Updates</h4>
                <p className="text-sm text-gray-600">
                  Get notified about new features and product improvements
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.featureUpdates}
                onChange={(e) => handlePreferenceChange('featureUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-blue-500" />
              <span className="text-blue-800 text-sm">You have unsaved changes</span>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={resetPreferences}
                variant="outline"
                size="sm"
                disabled={isSaving}
              >
                Reset
              </Button>
              <Button
                onClick={savePreferences}
                size="sm"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium mb-2">Important Information</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Critical security notifications will always be sent regardless of your preferences</li>
            <li>• You can change these settings at any time</li>
            <li>• SMS notifications may incur standard messaging rates</li>
            <li>• Expiry reminders help ensure uninterrupted service</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};