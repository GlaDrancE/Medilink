interface DashboardNotification {
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    actionText?: string;
    actionUrl?: string;
    createdAt: Date;
}

interface NotificationPreferences {
    emailNotifications: boolean;
    smsNotifications: boolean;
    expiryReminders: boolean;
    paymentReceipts: boolean;
    featureUpdates: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

class NotificationApiService {
    private baseUrl = '/api/notifications';

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                    ...options.headers,
                },
                ...options,
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || `HTTP ${response.status}: ${response.statusText}`
                };
            }

            return data;
        } catch (error) {
            console.error('Notification API error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error occurred'
            };
        }
    }

    /**
     * Get dashboard notifications for the current user
     */
    async getDashboardNotifications(): Promise<ApiResponse<{
        notifications: DashboardNotification[];
        count: number;
    }>> {
        return this.makeRequest('/dashboard');
    }

    /**
     * Get notification preferences for the current user
     */
    async getNotificationPreferences(): Promise<ApiResponse<NotificationPreferences>> {
        return this.makeRequest('/preferences');
    }

    /**
     * Update notification preferences for the current user
     */
    async updateNotificationPreferences(
        preferences: Partial<NotificationPreferences>
    ): Promise<ApiResponse<void>> {
        return this.makeRequest('/preferences', {
            method: 'PUT',
            body: JSON.stringify(preferences),
        });
    }

    /**
     * Mark notification as read/dismissed (if implemented on backend)
     */
    async dismissNotification(notificationId: string): Promise<ApiResponse<void>> {
        return this.makeRequest(`/dismiss/${notificationId}`, {
            method: 'POST',
        });
    }

    // Admin endpoints (for admin users)
    /**
     * Get expiring subscriptions (admin only)
     */
    async getExpiringSubscriptions(daysAhead: number = 7): Promise<ApiResponse<{
        subscriptions: any[];
        count: number;
        daysAhead: number;
    }>> {
        return this.makeRequest(`/admin/expiring?days=${daysAhead}`);
    }

    /**
     * Get grace period subscriptions (admin only)
     */
    async getGracePeriodSubscriptions(): Promise<ApiResponse<{
        subscriptions: any[];
        count: number;
    }>> {
        return this.makeRequest('/admin/grace-period');
    }

    /**
     * Manually trigger expiry reminders (admin only)
     */
    async triggerExpiryReminders(): Promise<ApiResponse<{
        processed: number;
        successful: number;
        failed: number;
    }>> {
        return this.makeRequest('/admin/trigger-reminders', {
            method: 'POST',
        });
    }

    /**
     * Send test notification (admin only)
     */
    async sendTestNotification(
        doctorId: string,
        type: 'EMAIL' | 'SMS' = 'EMAIL',
        daysUntilExpiry: number = 7
    ): Promise<ApiResponse<void>> {
        return this.makeRequest('/admin/test', {
            method: 'POST',
            body: JSON.stringify({
                doctorId,
                type,
                daysUntilExpiry,
            }),
        });
    }
}

export const notificationApi = new NotificationApiService();

// Error handling helper
export const handleNotificationError = (error: any) => {
    if (error?.response?.status === 401) {
        return {
            message: 'Please log in to access notifications',
            shouldRedirect: true,
            redirectUrl: '/login'
        };
    }

    if (error?.response?.status === 403) {
        return {
            message: 'You do not have permission to access this resource',
            shouldRedirect: false
        };
    }

    if (error?.response?.status >= 500) {
        return {
            message: 'Server error occurred. Please try again later.',
            shouldRedirect: false
        };
    }

    return {
        message: error?.message || 'An unexpected error occurred',
        shouldRedirect: false
    };
};

// Mock data for development/testing
export const mockNotifications: DashboardNotification[] = [
    {
        id: 'expiry-warning-1',
        type: 'warning',
        title: 'Subscription Expiring Soon',
        message: 'Your subscription expires in 3 days. Renew now to continue using premium features.',
        actionText: 'Renew Now',
        actionUrl: '/dashboard/doctor/subscription',
        createdAt: new Date()
    },
    {
        id: 'grace-period-1',
        type: 'error',
        title: 'Subscription Expired',
        message: 'Your subscription expired 2 days ago. You have 5 days left in your grace period.',
        actionText: 'Renew Now',
        actionUrl: '/dashboard/doctor/subscription',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
        id: 'payment-success-1',
        type: 'success',
        title: 'Payment Successful',
        message: 'Your subscription has been renewed successfully. Thank you!',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
        id: 'feature-update-1',
        type: 'info',
        title: 'New Feature Available',
        message: 'We\'ve added new analytics to help you track your practice performance.',
        actionText: 'Learn More',
        actionUrl: '/features',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
];

// Helper to get mock notifications based on subscription status
export const getMockNotifications = (subscriptionStatus?: any): DashboardNotification[] => {
    if (!subscriptionStatus) {
        return [];
    }

    const notifications: DashboardNotification[] = [];

    // Add expiry warnings for active subscriptions
    if (subscriptionStatus.isActive && subscriptionStatus.daysUntilExpiry) {
        if (subscriptionStatus.daysUntilExpiry <= 7) {
            notifications.push({
                id: `expiry-warning-${subscriptionStatus.subscription?.id}`,
                type: 'warning',
                title: 'Subscription Expiring Soon',
                message: `Your subscription expires in ${subscriptionStatus.daysUntilExpiry} day${subscriptionStatus.daysUntilExpiry > 1 ? 's' : ''}`,
                actionText: 'Renew Now',
                actionUrl: '/dashboard/doctor/subscription',
                createdAt: new Date()
            });
        }
    }

    // Add grace period notifications for expired subscriptions
    if (subscriptionStatus.status === 'EXPIRED' || subscriptionStatus.status === 'GRACE_PERIOD') {
        const daysExpired = subscriptionStatus.daysExpired || 1;
        const graceDaysLeft = Math.max(0, 7 - daysExpired);

        notifications.push({
            id: `grace-period-${subscriptionStatus.subscription?.id}`,
            type: 'error',
            title: 'Subscription Expired',
            message: `Your subscription expired ${daysExpired} day${daysExpired > 1 ? 's' : ''} ago. ${graceDaysLeft > 0 ? `You have ${graceDaysLeft} days left in your grace period.` : 'Your grace period has ended.'}`,
            actionText: 'Renew Now',
            actionUrl: '/dashboard/doctor/subscription',
            createdAt: new Date()
        });
    }

    return notifications;
};