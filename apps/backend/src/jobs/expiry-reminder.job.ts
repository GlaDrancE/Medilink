import cron from 'node-cron';
import { notificationService } from '../services/notification.service';

export class ExpiryReminderJob {
  private isRunning = false;

  /**
   * Start the expiry reminder cron job
   * Runs daily at 9:00 AM
   */
  start(): void {
    console.log('Starting expiry reminder job...');
    
    // Run daily at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      if (this.isRunning) {
        console.log('Expiry reminder job already running, skipping...');
        return;
      }

      this.isRunning = true;
      console.log('Running expiry reminder job at:', new Date().toISOString());

      try {
        const result = await notificationService.processExpiryReminders();
        console.log('Expiry reminder job completed:', result);
      } catch (error) {
        console.error('Error in expiry reminder job:', error);
      } finally {
        this.isRunning = false;
      }
    });

    console.log('Expiry reminder job scheduled to run daily at 9:00 AM');
  }

  /**
   * Run the job manually (for testing)
   */
  async runManually(): Promise<void> {
    if (this.isRunning) {
      console.log('Expiry reminder job already running');
      return;
    }

    this.isRunning = true;
    console.log('Running expiry reminder job manually at:', new Date().toISOString());

    try {
      const result = await notificationService.processExpiryReminders();
      console.log('Manual expiry reminder job completed:', result);
      return result;
    } catch (error) {
      console.error('Error in manual expiry reminder job:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Check if job is currently running
   */
  isJobRunning(): boolean {
    return this.isRunning;
  }
}

export const expiryReminderJob = new ExpiryReminderJob();