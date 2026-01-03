'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  X,
  AlertTriangle,
  Clock,
  CheckCircle,
  Info,
  Settings,
  RefreshCw
} from 'lucide-react';

interface DashboardNotification {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  createdAt: Date;
  dismissed?: boolean;
}

interface NotificationCenterProps {
  className?: string;
  showHeader?: boolean;
  maxNotifications?: number;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className = '',
  showHeader = true,
  maxNotifications = 5
}) => {
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadNotifications();

    // Set up polling for new notifications every 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setError(null);

      // In a real implementation, this would call the API
      // For now, we'll simulate with mock data
      const mockNotifications: DashboardNotification[] = [
        {
          id: 'expiry-warning-1',
          type: 'warning',
          title: 'Subscription Expiring Soon',
          message: 'Your subscription expires in 3 days',
          actionText: 'Renew Now',
          actionUrl: '/dashboard/doctor/subscription',
          createdAt: new Date()
        },
        {
          id: 'payment-success-1',
          type: 'success',
          title: 'Payment Successful',
          message: 'Your subscription has been renewed successfully',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        }
      ];

      // Filter out dismissed notifications
      const activeNotifications = mockNotifications.filter(
        notification => !dismissedNotifications.has(notification.id)
      );

      setNotifications(activeNotifications.slice(0, maxNotifications));
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const dismissNotification = (notificationId: string) => {
    setDismissedNotifications(prev => new Set([...prev, notificationId]));
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleAction = (notification: DashboardNotification) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'warning':
        return 'secondary' as const;
      case 'error':
        return 'destructive' as const;
      case 'success':
        return 'default' as const;
      case 'info':
      default:
        return 'outline' as const;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
            <Button
              onClick={loadNotifications}
              variant="ghost"
              size="sm"
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className={className}>
        {showHeader && (
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="h-5 w-5 text-gray-500" />
            <h3 className="font-medium text-gray-900">Notifications</h3>
          </div>
        )}
        <Card>
          <CardContent className="p-6 text-center">
            <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No new notifications</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-500" />
            <h3 className="font-medium text-gray-900">Notifications</h3>
            {notifications.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {notifications.length}
              </Badge>
            )}
          </div>
          <Button
            onClick={loadNotifications}
            variant="ghost"
            size="sm"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card key={notification.id} className="relative">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {notification.title}
                    </h4>
                    <Badge variant={getNotificationBadgeVariant(notification.type)} className="text-xs">
                      {notification.type}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {notification.createdAt.toLocaleDateString()}
                    </span>

                    {notification.actionText && (
                      <Button
                        onClick={() => handleAction(notification)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {notification.actionText}
                      </Button>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => dismissNotification(notification.id)}
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Compact notification bell for header
export const NotificationBell: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // In a real implementation, this would fetch the notification count
    setNotificationCount(2); // Mock count
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setShowDropdown(!showDropdown)}
        variant="ghost"
        size="sm"
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {notificationCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {notificationCount > 9 ? '9+' : notificationCount}
          </Badge>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <Card className="shadow-lg border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Notifications</CardTitle>
                <Button
                  onClick={() => setShowDropdown(false)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <NotificationCenter
                showHeader={false}
                maxNotifications={3}
                className="p-4"
              />
              <div className="border-t p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-center"
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigate to full notifications page
                  }}
                >
                  View All Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Inline notification for specific contexts
export const InlineNotification: React.FC<{
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
}> = ({ type, title, message, actionText, onAction, onDismiss, className = '' }) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      case 'success':
        return 'text-green-800';
      case 'info':
      default:
        return 'text-blue-800';
    }
  };

  return (
    <Card className={`${getBackgroundColor()} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getNotificationIcon(type)}
          </div>

          <div className="flex-1">
            <h4 className={`font-medium ${getTextColor()} mb-1`}>
              {title}
            </h4>
            <p className={`text-sm ${getTextColor()} opacity-90`}>
              {message}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {actionText && onAction && (
              <Button
                onClick={onAction}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {actionText}
              </Button>
            )}

            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get notification icon (used by InlineNotification)
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'error':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'info':
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};