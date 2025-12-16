import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3002/api/v1",
});

// Add token interceptor
api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Subscription API calls
export const subscriptionApi = {
    // Get current subscription status
    getStatus: async () => {
        try {
            const response = await api.get("/subscription/status");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Create new subscription
    create: async (plan: 'MONTHLY' | 'YEARLY') => {
        try {
            const response = await api.post("/subscription/create", { plan });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Upgrade subscription
    upgrade: async (newPlan: 'MONTHLY' | 'YEARLY') => {
        try {
            const response = await api.post("/subscription/upgrade", { newPlan });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Cancel subscription
    cancel: async () => {
        try {
            const response = await api.post("/subscription/cancel");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get subscription history
    getHistory: async () => {
        try {
            const response = await api.get("/subscription/history");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Check feature access
    checkFeatureAccess: async (feature: string) => {
        try {
            const response = await api.get(`/subscription/feature/${feature}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

// Payment API calls
export const paymentApi = {
    // Create payment order
    createOrder: async (plan: 'MONTHLY' | 'YEARLY', customerInfo: {
        name: string;
        email: string;
        phone?: string;
    }) => {
        try {
            const response = await api.post("/payment/create-order", { plan, customerInfo });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Verify payment
    verifyPayment: async (paymentData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }) => {
        try {
            const response = await api.post("/payment/verify", paymentData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get payment history
    getHistory: async () => {
        try {
            const response = await api.get("/payment/history");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get payment statistics
    getStatistics: async () => {
        try {
            const response = await api.get("/payment/statistics");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Handle payment failure
    handleFailure: async (paymentId: string, reason?: string) => {
        try {
            const response = await api.post("/payment/failure", { paymentId, reason });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

// Error handler for subscription-related API calls
export const handleSubscriptionError = (error: any) => {
    if (error.response?.data?.subscriptionRequired) {
        return {
            requiresSubscription: true,
            subscriptionStatus: error.response.data.subscriptionStatus,
            message: error.response.data.error?.message || 'Subscription required',
            feature: error.response.data.feature
        };
    }

    return {
        requiresSubscription: false,
        message: error.response?.data?.error?.message || error.message || 'An error occurred'
    };
};