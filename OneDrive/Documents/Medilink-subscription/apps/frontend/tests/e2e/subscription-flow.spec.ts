import { test, expect, Page } from '@playwright/test';

// Test configuration
const TEST_USER = {
  email: 'test.doctor@example.com',
  password: 'testpassword123',
  name: 'Dr. Test Doctor'
};

const RAZORPAY_TEST_CARDS = {
  success: '4111111111111111',
  failure: '4000000000000002'
};

test.describe('Subscription Flow E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Setup test environment
    await page.goto('/');
    
    // Login as test doctor
    await loginAsTestDoctor(page);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Complete Subscription Journey', () => {
    test('should complete full subscription flow from dashboard to payment success', async () => {
      // Step 1: Navigate to dashboard and verify free plan status
      await page.goto('/dashboard/doctor');
      
      // Verify subscription banner is shown for free users
      await expect(page.locator('[data-testid="subscription-banner"]')).toBeVisible();
      await expect(page.locator('text=Unlock Premium Features')).toBeVisible();
      
      // Verify premium features are locked
      const newPatientButton = page.locator('[data-testid="new-patient-button"]');
      await expect(newPatientButton).toBeDisabled();
      await expect(page.locator('text=Premium')).toBeVisible();

      // Step 2: Click on subscription banner to go to plans
      await page.locator('[data-testid="subscription-banner"] button').click();
      await expect(page).toHaveURL('/subscription');

      // Step 3: Verify subscription plans are displayed
      await expect(page.locator('text=Choose Your Plan')).toBeVisible();
      await expect(page.locator('[data-testid="monthly-plan"]')).toBeVisible();
      await expect(page.locator('[data-testid="yearly-plan"]')).toBeVisible();
      
      // Verify plan details
      await expect(page.locator('text=₹99/month')).toBeVisible();
      await expect(page.locator('text=₹999/year')).toBeVisible();

      // Step 4: Select monthly plan
      await page.locator('[data-testid="monthly-plan"] button').click();
      
      // Verify payment form is displayed
      await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();
      await expect(page.locator('text=Monthly Plan - ₹99')).toBeVisible();

      // Step 5: Fill payment form with test card
      await page.locator('[data-testid="card-number"]').fill(RAZORPAY_TEST_CARDS.success);
      await page.locator('[data-testid="card-expiry"]').fill('12/25');
      await page.locator('[data-testid="card-cvv"]').fill('123');
      await page.locator('[data-testid="card-name"]').fill(TEST_USER.name);

      // Step 6: Submit payment
      await page.locator('[data-testid="pay-button"]').click();
      
      // Verify payment processing states
      await expect(page.locator('text=Processing Payment')).toBeVisible();
      await expect(page.locator('[data-testid="payment-progress"]')).toBeVisible();

      // Step 7: Wait for payment success
      await expect(page.locator('text=Payment Successful')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('[data-testid="success-icon"]')).toBeVisible();
      
      // Verify subscription details
      await expect(page.locator('text=Monthly Plan')).toBeVisible();
      await expect(page.locator('text=₹99')).toBeVisible();

      // Step 8: Go to dashboard and verify premium access
      await page.locator('[data-testid="go-to-dashboard"]').click();
      await expect(page).toHaveURL('/dashboard/doctor');
      
      // Verify subscription banner is no longer shown
      await expect(page.locator('[data-testid="subscription-banner"]')).not.toBeVisible();
      
      // Verify premium features are now accessible
      const newPatientButtonAfter = page.locator('[data-testid="new-patient-button"]');
      await expect(newPatientButtonAfter).toBeEnabled();
      await expect(page.locator('text=Premium Active')).toBeVisible();

      // Step 9: Test premium feature access
      await newPatientButtonAfter.click();
      await expect(page.locator('[data-testid="add-patient-modal"]')).toBeVisible();
    });

    test('should handle payment failure gracefully', async () => {
      // Navigate to subscription page
      await page.goto('/subscription');
      
      // Select monthly plan
      await page.locator('[data-testid="monthly-plan"] button').click();
      
      // Fill payment form with failing test card
      await page.locator('[data-testid="card-number"]').fill(RAZORPAY_TEST_CARDS.failure);
      await page.locator('[data-testid="card-expiry"]').fill('12/25');
      await page.locator('[data-testid="card-cvv"]').fill('123');
      await page.locator('[data-testid="card-name"]').fill(TEST_USER.name);

      // Submit payment
      await page.locator('[data-testid="pay-button"]').click();
      
      // Verify payment failure is handled
      await expect(page.locator('text=Payment Failed')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('[data-testid="error-icon"]')).toBeVisible();
      
      // Verify error message and retry option
      await expect(page.locator('text=Your payment could not be processed')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
      
      // Test retry functionality
      await page.locator('[data-testid="retry-button"]').click();
      await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();
    });

    test('should handle subscription upgrade flow', async () => {
      // Prerequisite: User has active monthly subscription
      await setupActiveMonthlySubscription(page);
      
      // Navigate to subscription management
      await page.goto('/subscription');
      await page.locator('[data-testid="manage-tab"]').click();
      
      // Verify current subscription details
      await expect(page.locator('text=Monthly Plan')).toBeVisible();
      await expect(page.locator('text=Active')).toBeVisible();
      
      // Click upgrade to yearly
      await page.locator('[data-testid="upgrade-to-yearly"]').click();
      
      // Verify upgrade confirmation
      await expect(page.locator('text=Upgrade to Yearly Plan')).toBeVisible();
      await expect(page.locator('text=Save ₹189 per year')).toBeVisible();
      
      // Confirm upgrade
      await page.locator('[data-testid="confirm-upgrade"]').click();
      
      // Complete upgrade payment (prorated amount)
      await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();
      await fillPaymentForm(page, RAZORPAY_TEST_CARDS.success);
      await page.locator('[data-testid="pay-button"]').click();
      
      // Verify upgrade success
      await expect(page.locator('text=Upgrade Successful')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('text=Yearly Plan')).toBeVisible();
    });

    test('should handle subscription cancellation flow', async () => {
      // Prerequisite: User has active subscription
      await setupActiveMonthlySubscription(page);
      
      // Navigate to subscription settings
      await page.goto('/subscription');
      await page.locator('[data-testid="settings-tab"]').click();
      
      // Scroll to danger zone
      await page.locator('[data-testid="danger-zone"]').scrollIntoViewIfNeeded();
      
      // Click cancel subscription
      await page.locator('[data-testid="cancel-subscription"]').click();
      
      // Verify cancellation confirmation dialog
      await expect(page.locator('text=Cancel Subscription')).toBeVisible();
      await expect(page.locator('text=You will retain access until')).toBeVisible();
      
      // Confirm cancellation
      await page.locator('[data-testid="confirm-cancellation"]').click();
      
      // Verify cancellation success
      await expect(page.locator('text=Subscription cancelled successfully')).toBeVisible();
      await expect(page.locator('text=Cancelled')).toBeVisible();
      
      // Verify access is retained until end date
      await page.goto('/dashboard/doctor');
      const newPatientButton = page.locator('[data-testid="new-patient-button"]');
      await expect(newPatientButton).toBeEnabled(); // Still accessible until end date
    });
  });

  test.describe('Access Control Integration', () => {
    test('should block premium features for free users', async () => {
      await page.goto('/dashboard/doctor');
      
      // Test New Patient feature
      const newPatientButton = page.locator('[data-testid="new-patient-button"]');
      await expect(newPatientButton).toBeDisabled();
      
      // Hover to see premium message
      await newPatientButton.hover();
      await expect(page.locator('text=Premium feature')).toBeVisible();
      
      // Test Create Prescription feature
      const prescriptionButton = page.locator('[data-testid="create-prescription-button"]');
      await expect(prescriptionButton).toBeDisabled();
      
      // Test Send Reminder feature
      const reminderButton = page.locator('[data-testid="send-reminder-button"]');
      await expect(reminderButton).toBeDisabled();
      
      // Verify premium badges are shown
      await expect(page.locator('text=Premium').first()).toBeVisible();
    });

    test('should allow premium features for subscribed users', async () => {
      // Setup active subscription
      await setupActiveMonthlySubscription(page);
      
      await page.goto('/dashboard/doctor');
      
      // Test New Patient feature
      const newPatientButton = page.locator('[data-testid="new-patient-button"]');
      await expect(newPatientButton).toBeEnabled();
      
      await newPatientButton.click();
      await expect(page.locator('[data-testid="add-patient-modal"]')).toBeVisible();
      await page.locator('[data-testid="close-modal"]').click();
      
      // Test Create Prescription feature
      const prescriptionButton = page.locator('[data-testid="create-prescription-button"]');
      await expect(prescriptionButton).toBeEnabled();
      
      // Test Send Reminder feature
      const reminderButton = page.locator('[data-testid="send-reminder-button"]');
      await expect(reminderButton).toBeEnabled();
      
      // Verify no premium badges are shown
      await expect(page.locator('text=Premium').first()).not.toBeVisible();
    });

    test('should show subscription gate for premium features', async () => {
      await page.goto('/dashboard/doctor');
      
      // Click on disabled premium feature
      await page.locator('[data-testid="new-patient-button"]').click({ force: true });
      
      // Verify subscription gate is shown
      await expect(page.locator('[data-testid="subscription-gate"]')).toBeVisible();
      await expect(page.locator('text=Add New Patients')).toBeVisible();
      await expect(page.locator('text=Subscription required')).toBeVisible();
      
      // Verify upgrade button works
      await page.locator('[data-testid="upgrade-now"]').click();
      await expect(page).toHaveURL('/subscription');
    });
  });

  test.describe('Subscription Management', () => {
    test('should display subscription analytics correctly', async () => {
      await setupActiveMonthlySubscription(page);
      
      await page.goto('/subscription');
      await page.locator('[data-testid="analytics-tab"]').click();
      
      // Verify analytics dashboard
      await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
      await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-subscriptions"]')).toBeVisible();
      await expect(page.locator('[data-testid="payment-success-rate"]')).toBeVisible();
      
      // Verify feature usage metrics
      await expect(page.locator('text=Feature Usage')).toBeVisible();
      await expect(page.locator('text=Patients Added')).toBeVisible();
      await expect(page.locator('text=Prescriptions Created')).toBeVisible();
    });

    test('should allow notification preferences management', async () => {
      await setupActiveMonthlySubscription(page);
      
      await page.goto('/subscription');
      await page.locator('[data-testid="settings-tab"]').click();
      
      // Verify notification preferences section
      await expect(page.locator('text=Notification Preferences')).toBeVisible();
      
      // Test toggling email notifications
      const emailToggle = page.locator('[data-testid="email-notifications-toggle"]');
      const initialState = await emailToggle.isChecked();
      
      await emailToggle.click();
      await expect(page.locator('text=Preferences saved')).toBeVisible();
      
      // Verify state changed
      await expect(emailToggle).toBeChecked({ checked: !initialState });
      
      // Test other notification types
      await page.locator('[data-testid="sms-notifications-toggle"]').click();
      await page.locator('[data-testid="expiry-reminders-toggle"]').click();
      
      await expect(page.locator('text=Preferences saved')).toBeVisible();
    });

    test('should display billing history correctly', async () => {
      await setupActiveMonthlySubscription(page);
      
      await page.goto('/subscription');
      await page.locator('[data-testid="manage-tab"]').click();
      
      // Verify billing history section
      await expect(page.locator('text=Recent Payments')).toBeVisible();
      
      // Verify payment entries
      await expect(page.locator('[data-testid="payment-entry"]').first()).toBeVisible();
      await expect(page.locator('text=₹99')).toBeVisible();
      await expect(page.locator('text=captured')).toBeVisible();
      
      // Test download invoice
      await page.locator('[data-testid="download-invoice"]').click();
      await expect(page.locator('text=Invoice download started')).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async () => {
      // Simulate network failure
      await page.route('**/api/subscription/**', route => route.abort());
      
      await page.goto('/subscription');
      
      // Verify error message is shown
      await expect(page.locator('text=Network connection issue')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
      
      // Test retry functionality
      await page.unroute('**/api/subscription/**');
      await page.locator('[data-testid="retry-button"]').click();
      
      // Verify content loads after retry
      await expect(page.locator('text=Choose Your Plan')).toBeVisible();
    });

    test('should handle session expiry during payment', async () => {
      await page.goto('/subscription');
      await page.locator('[data-testid="monthly-plan"] button').click();
      
      // Simulate session expiry
      await page.evaluate(() => localStorage.removeItem('token'));
      
      // Try to submit payment
      await fillPaymentForm(page, RAZORPAY_TEST_CARDS.success);
      await page.locator('[data-testid="pay-button"]').click();
      
      // Verify redirect to login
      await expect(page.locator('text=Please log in again')).toBeVisible();
    });

    test('should handle subscription service outage', async () => {
      // Mock service outage
      await page.route('**/api/payment/create-order', route => 
        route.fulfill({
          status: 503,
          body: JSON.stringify({
            success: false,
            error: 'Payment service temporarily unavailable'
          })
        })
      );
      
      await page.goto('/subscription');
      await page.locator('[data-testid="monthly-plan"] button').click();
      
      // Verify service outage message
      await expect(page.locator('text=Payment service temporarily unavailable')).toBeVisible();
      await expect(page.locator('text=Please try again shortly')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work correctly on mobile devices', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/subscription');
      
      // Verify mobile layout
      await expect(page.locator('[data-testid="mobile-plan-card"]')).toBeVisible();
      
      // Test mobile payment flow
      await page.locator('[data-testid="monthly-plan"] button').click();
      await expect(page.locator('[data-testid="mobile-payment-form"]')).toBeVisible();
      
      // Verify mobile-optimized form fields
      await expect(page.locator('[data-testid="card-number"]')).toBeVisible();
      await expect(page.locator('[data-testid="card-number"]')).toHaveAttribute('inputmode', 'numeric');
    });
  });
});

// Helper functions
async function loginAsTestDoctor(page: Page) {
  await page.goto('/login');
  await page.locator('[data-testid="email"]').fill(TEST_USER.email);
  await page.locator('[data-testid="password"]').fill(TEST_USER.password);
  await page.locator('[data-testid="login-button"]').click();
  await expect(page).toHaveURL('/dashboard/doctor');
}

async function setupActiveMonthlySubscription(page: Page) {
  // This would set up an active subscription for testing
  // In a real implementation, this might call a test API endpoint
  // or use database seeding
  await page.evaluate(() => {
    localStorage.setItem('test-subscription-active', 'true');
  });
}

async function fillPaymentForm(page: Page, cardNumber: string) {
  await page.locator('[data-testid="card-number"]').fill(cardNumber);
  await page.locator('[data-testid="card-expiry"]').fill('12/25');
  await page.locator('[data-testid="card-cvv"]').fill('123');
  await page.locator('[data-testid="card-name"]').fill(TEST_USER.name);
}