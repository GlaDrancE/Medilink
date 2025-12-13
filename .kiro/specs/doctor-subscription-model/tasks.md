# Implementation Plan

- [x] 1. Set up database schema and models for subscription system
  - Extend existing Doctor model with subscription fields in Prisma schema
  - Create new Subscription model with relationships to Doctor
  - Create PaymentTransaction model for tracking payments
  - Add enums for SubscriptionStatus, SubscriptionPlan, and PaymentStatus
  - Generate Prisma client and run database migrations

  - _Requirements: 4.2, 6.3_

- [ ] 2. Configure Razorpay integration and environment setup
  - Add Razorpay SDK dependency to backend package.json

  - Create Razorpay configuration service with API keys from environment
  - Set up environment variables for RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
  - Create Razorpay client initialization utility
  - _Requirements: 6.1, 6.4_

- [ ] 3. Implement core subscription service layer
  - Create SubscriptionService class with methods for checking status, creating, upgrading, and cancelling subscriptions
  - Implement subscription status validation logic
  - Create utility functions for calculating subscription end dates
  - Add subscription plan configuration constants

  - Write unit tests for subscription service methods
  - _Requirements: 1.3, 2.5, 5.1_

- [ ] 4. Build payment processing functionality
  - Create PaymentService class for Razorpay order creation and verification

  - Implement payment signature verification for security
  - Create payment order generation with proper receipt handling
  - Add payment status tracking and updates
  - Write unit tests for payment processing logic
  - _Requirements: 1.2, 1.4, 6.2_

- [ ] 5. Implement subscription API endpoints
  - Create subscription controller with routes for status, create, upgrade, cancel, and history
  - Add payment controller with routes for order creation, verification, and webhooks
  - Implement request validation and error handling for all endpoints
  - Add authentication middleware to protect subscription endpoints
  - Write integration tests for API endpoints
  - _Requirements: 1.1, 5.2, 5.3, 5.5_

- [x] 6. Create webhook handler for payment confirmations
  - Implement webhook endpoint to receive Razorpay payment notifications
  - Add webhook signature verification for security
  - Create background job processing for webhook events
  - Implement subscription status updates based on payment confirmations
  - Add error handling and retry logic for failed webhook processing
  - Write tests for webhook processing scenarios

  - _Requirements: 4.4, 6.4, 6.5_

- [x] 7. Build subscription access control middleware
  - Create middleware function to check subscription status before feature access
  - Implement feature-specific access control logic
  - Add subscription validation for New Patient, Create Prescription, and Send Reminder features
  - Create helper functions for subscription expiry checks
  - Write unit tests for access control middleware

  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

- [x] 8. Implement frontend subscription gate component
  - Create SubscriptionGate React component to wrap premium features
  - Implement useSubscriptionGate hook for subscription status management
  - Add logic to redirect to subscription page when access is denied
  - Create subscription status context for global state management
  - Write unit tests for subscription gate component
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 9. Build subscription plans and payment UI



  - Create SubscriptionPlans component displaying monthly and yearly options
  - Implement PaymentForm component with Razorpay integration
  - Add payment processing states (loading, success, error)
  - Create subscription page with plan selection and payment flow
  - Style components to match existing design system
  - Write component tests for subscription UI
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 10. Create subscription management dashboard





  - Build SubscriptionStatus component showing current plan and expiry
  - Implement PaymentHistory component displaying transaction records

  - Create SubscriptionSettings component for plan management
  - Add subscription upgrade/downgrade functionality
  - Implement subscription cancellation with confirmation dialog
  - Write tests for subscription management components
  - _Requirements: 5.1, 5.2, 5.3, 5.5_





- [ ] 11. Integrate access control into existing doctor dashboard
  - Modify existing "New Patient" button to use SubscriptionGate
  - Update "Create Prescription" button with subscription check
  - Add subscription gate to "Send Reminder" functionality




  - Implement subscription banner for unsubscribed doctors
  - Add subscription status indicator in dashboard header
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3_


- [x] 12. Add subscription expiry notifications and reminders



  - Create notification service for subscription expiry warnings
  - Implement email/SMS reminder system for expiring subscriptions
  - Add dashboard notifications for subscriptions expiring within 7 days
  - Create background job for processing expiry reminders


  - Add grace period handling for recently expired subscriptions
  - Write tests for notification and reminder functionality




  - _Requirements: 3.5, 5.4_

- [ ] 13. Implement subscription analytics and logging
  - Add audit logging for all subscription status changes
  - Create payment transaction logging with security considerations



  - Implement subscription metrics tracking (MRR, churn rate)
  - Add error logging for payment processing failures
  - Create admin dashboard queries for subscription analytics
  - Write tests for logging and analytics functionality
  - _Requirements: 4.1, 4.2, 4.3, 4.5, 6.5_

- [ ] 14. Add comprehensive error handling and user feedback
  - Implement user-friendly error messages for payment failures
  - Add retry mechanisms for failed payment attempts
  - Create error boundaries for subscription-related components
  - Add loading states and progress indicators for payment processing
  - Implement graceful degradation for subscription service outages
  - Write tests for error handling scenarios
  - _Requirements: 1.4, 5.4_

- [ ] 15. Perform end-to-end testing and integration validation
  - Create end-to-end test scenarios for complete subscription flow
  - Test payment processing with Razorpay test environment
  - Validate webhook processing and subscription updates
  - Test access control across all premium features
  - Verify subscription expiry and renewal workflows
  - Perform security testing for payment data handling
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 6.4_
