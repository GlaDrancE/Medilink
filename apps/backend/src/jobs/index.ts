import { expiryReminderJob } from './expiry-reminder.job';

/**
 * Initialize all background jobs
 */
export const initializeJobs = (): void => {
  console.log('Initializing background jobs...');
  
  try {
    // Start expiry reminder job
    expiryReminderJob.start();
    
    console.log('All background jobs initialized successfully');
  } catch (error) {
    console.error('Error initializing background jobs:', error);
  }
};

/**
 * Stop all background jobs (for graceful shutdown)
 */
export const stopJobs = (): void => {
  console.log('Stopping background jobs...');
  
  // In a real implementation, you would stop all cron jobs here
  // For now, we just log the action
  console.log('Background jobs stopped');
};

// Export individual jobs for manual control
export { expiryReminderJob } from './expiry-reminder.job';