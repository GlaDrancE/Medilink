# Subscription & Payment API Documentation

## Overview

This API provides endpoints for managing doctor subscriptions and payment processing using Razorpay integration.

## Authentication

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
```
/api/v1
```

## Subscription Endpoints

### Get Subscription Status
**GET** `/subscription/status`

Get current subscription status for authenticated doctor.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ACTIVE",
    "isActive": true,
    "expiresAt": "2025-10-19T14:12:07.358Z",
    "daysUntilExpiry": 30,
    "subscription": {
      "planName": "Monthly Plan",
      "status": "ACTIVE",
      "displayPrice": "₹99",
      "startDate": "9/19/2025",
      "endDate": "10/19/2025",
      "daysRemaining": 30,
      "isActive": true,
      "features": ["unlimited_patients", "prescriptions", "reminders"],
      "description": "Perfect for getting started with all essential features"
    }
  }
}
```

### Create Subscription
**POST** `/subscription/create`

Create new subscription for authenticated doctor.

**Request Body:**
```json
{
  "plan": "MONTHLY" // or "YEARLY"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": { /* subscription details */ },
    "message": "Subscription created successfully"
  }
}
```

### Upgrade Subscription
**POST** `/subscription/upgrade`

Upgrade subscription plan for authenticated doctor.

**Request Body:**
```json
{
  "newPlan": "YEARLY"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": { /* updated subscription details */ },
    "message": "Subscription upgraded successfully"
  }
}
```

### Cancel Subscription
**POST** `/subscription/cancel`

Cancel subscription for authenticated doctor.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Subscription cancelled successfully. Access will continue until the end of your billing period."
  }
}
```

### Get Subscription History
**GET** `/subscription/history`

Get subscription history for authenticated doctor.

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptions": [
      { /* subscription details */ }
    ],
    "total": 1
  }
}
```

### Check Feature Access
**GET** `/subscription/feature/:feature`

Check feature access for authenticated doctor.

**Parameters:**
- `feature` (string): Feature name to check

**Response:**
```json
{
  "success": true,
  "data": {
    "feature": "NEW_PATIENT",
    "hasAccess": true,
    "message": "Access granted"
  }
}
```

## Payment Endpoints

### Create Payment Order
**POST** `/payment/create-order`

Create Razorpay order for subscription payment.

**Request Body:**
```json
{
  "plan": "MONTHLY",
  "customerInfo": {
    "name": "Dr. John Doe",
    "email": "john.doe@example.com",
    "phone": "9876543210"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_123456789",
    "amount": 9900,
    "currency": "INR",
    "keyId": "rzp_test_...",
    "customerInfo": { /* customer details */ },
    "displayAmount": "₹99",
    "planDetails": { /* plan configuration */ }
  }
}
```

### Verify Payment
**POST** `/payment/verify`

Verify payment signature and process successful payment.

**Request Body:**
```json
{
  "razorpay_order_id": "order_123456789",
  "razorpay_payment_id": "pay_987654321",
  "razorpay_signature": "signature_hash"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "pay_987654321",
    "subscriptionId": "sub_123456789",
    "message": "Payment verified and subscription activated successfully"
  }
}
```

### Get Payment History
**GET** `/payment/history`

Get payment history for authenticated doctor.

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "payment_123",
        "razorpayPaymentId": "pay_987654321",
        "amount": 9900,
        "displayAmount": "₹99",
        "currency": "INR",
        "status": "SUCCESS",
        "paymentMethod": "card",
        "createdAt": "2025-09-19T14:12:07.358Z",
        "subscription": { /* related subscription */ }
      }
    ],
    "total": 1
  }
}
```

### Get Payment Statistics
**GET** `/payment/statistics`

Get payment statistics for authenticated doctor.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPayments": 5,
    "successfulPayments": 4,
    "failedPayments": 1,
    "totalRevenue": 39600,
    "displayTotalRevenue": "₹396",
    "averageOrderValue": 9900,
    "displayAverageOrderValue": "₹99",
    "successRate": 80.00
  }
}
```

### Handle Payment Failure
**POST** `/payment/failure`

Handle payment failure notification.

**Request Body:**
```json
{
  "paymentId": "pay_987654321",
  "reason": "Payment failed due to insufficient funds"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Payment failure recorded successfully"
  }
}
```

### Process Refund
**POST** `/payment/refund`

Process refund request.

**Request Body:**
```json
{
  "paymentId": "pay_987654321",
  "amount": 9900 // optional, full refund if not specified
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refundId": "rfnd_123456789",
    "message": "Refund processed successfully"
  }
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_001",
    "message": "User-friendly error message",
    "retryable": true
  },
  "timestamp": "2025-09-19T14:12:07.358Z"
}
```

### Error Codes

- `PAYMENT_001` - Invalid amount
- `PAYMENT_002` - Invalid plan
- `PAYMENT_003` - Invalid customer info
- `PAYMENT_004` - Invalid signature
- `PAYMENT_101` - Order creation failed
- `PAYMENT_102` - Payment capture failed
- `PAYMENT_201` - Subscription already active
- `PAYMENT_202` - Doctor not found
- `PAYMENT_301` - Network error
- `PAYMENT_401` - Signature verification failed
- `PAYMENT_402` - Unauthorized access

## Subscription Plans

### Monthly Plan
- **Price:** ₹99 (9900 paise)
- **Duration:** 30 days
- **Features:** unlimited_patients, prescriptions, reminders, basic_support

### Yearly Plan
- **Price:** ₹999 (99900 paise)
- **Duration:** 365 days
- **Features:** unlimited_patients, prescriptions, reminders, priority_support, advanced_analytics, bulk_operations
- **Savings:** ₹189 compared to 12 monthly payments

## Premium Features

The following features require an active subscription:
- `NEW_PATIENT` - Adding new patients
- `CREATE_PRESCRIPTION` - Creating prescriptions
- `SEND_REMINDER` - Sending SMS/WhatsApp reminders

## Rate Limiting

Subscription operations are rate-limited to prevent abuse:
- Maximum 3 upgrade attempts per day
- Maximum 2 cancellation attempts per day

## Webhook Integration

For real-time payment updates, implement webhook endpoints to receive Razorpay notifications. See the webhook documentation for implementation details.