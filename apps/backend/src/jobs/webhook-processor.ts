import { webhookService } from '../services/webhook.service';
import { 
  calculateRetryDelay,
  shouldRetryWebhook,
  createWebhookLogEntry
} from '../utils/webhook.utils';

/**
 * Background job processor for webhook handling
 */
export class WebhookProcessor {
  private static instance: WebhookProcessor;
  private processingQueue: Map<string, WebhookJob> = new Map();
  private retryQueue: WebhookJob[] = [];
  private isProcessing = false;

  private constructor() {}

  public static getInstance(): WebhookProcessor {
    if (!WebhookProcessor.instance) {
      WebhookProcessor.instance = new WebhookProcessor();
    }
    return WebhookProcessor.instance;
  }

  /**
   * Add webhook to processing queue
   */
  async addWebhookJob(
    id: string,
    payload: string,
    signature: string,
    headers: Record<string, string>,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<void> {
    const job: WebhookJob = {
      id,
      payload,
      signature,
      headers,
      priority,
      attempts: 0,
      maxAttempts: 5,
      createdAt: new Date(),
      status: 'pending'
    };

    this.processingQueue.set(id, job);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.startProcessing();
    }
  }

  /**
   * Start processing webhook jobs
   */
  private async startProcessing(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('Starting webhook processor...');

    try {
      while (this.processingQueue.size > 0 || this.retryQueue.length > 0) {
        // Process retry queue first (failed jobs)
        if (this.retryQueue.length > 0) {
          const job = this.retryQueue.shift()!;
          await this.processWebhookJob(job);
        }
        
        // Process new jobs
        if (this.processingQueue.size > 0) {
          const jobs = Array.from(this.processingQueue.values());
          
          // Sort by priority and creation time
          jobs.sort((a, b) => {
            const priorityOrder = { high: 3, normal: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return a.createdAt.getTime() - b.createdAt.getTime();
          });

          const job = jobs[0];
          this.processingQueue.delete(job.id);
          await this.processWebhookJob(job);
        }

        // Small delay to prevent CPU spinning
        await this.sleep(100);
      }
    } catch (error) {
      console.error('Error in webhook processor:', error);
    } finally {
      this.isProcessing = false;
      console.log('Webhook processor stopped');
    }
  }

  /**
   * Process individual webhook job
   */
  private async processWebhookJob(job: WebhookJob): Promise<void> {
    job.attempts++;
    job.status = 'processing';
    job.lastAttemptAt = new Date();

    try {
      console.log(`Processing webhook job ${job.id}, attempt ${job.attempts}`);

      const result = await webhookService.processWebhook(
        job.payload,
        job.signature,
        job.headers
      );

      if (result.success) {
        job.status = 'completed';
        job.completedAt = new Date();
        console.log(`Webhook job ${job.id} completed successfully`);
        
        // Log successful processing
        this.logWebhookJob(job, result.message);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      job.status = 'failed';
      job.error = errorMessage;
      job.failedAt = new Date();

      console.error(`Webhook job ${job.id} failed:`, errorMessage);

      // Check if we should retry
      if (shouldRetryWebhook(error, job.attempts) && job.attempts < job.maxAttempts) {
        const retryDelay = calculateRetryDelay(job.attempts);
        job.status = 'retrying';
        job.nextRetryAt = new Date(Date.now() + retryDelay);
        
        console.log(`Scheduling retry for webhook job ${job.id} in ${retryDelay}ms`);
        
        // Schedule retry
        setTimeout(() => {
          this.retryQueue.push(job);
          if (!this.isProcessing) {
            this.startProcessing();
          }
        }, retryDelay);
      } else {
        console.error(`Webhook job ${job.id} permanently failed after ${job.attempts} attempts`);
        this.logWebhookJob(job, `Permanently failed: ${errorMessage}`);
      }
    }
  }

  /**
   * Log webhook job processing
   */
  private logWebhookJob(job: WebhookJob, message: string): void {
    try {
      const webhookData = JSON.parse(job.payload);
      const logEntry = createWebhookLogEntry(
        webhookData.event,
        webhookData.payload?.payment?.entity?.id,
        webhookData.payload?.order?.entity?.id,
        job.status === 'completed',
        job.error
      );

      console.log('Webhook processing log:', JSON.stringify(logEntry, null, 2));
      
      // In production, you might want to store this in a database
      // or send to a logging service like Winston, Sentry, etc.
    } catch (error) {
      console.error('Error logging webhook job:', error);
    }
  }

  /**
   * Get processing statistics
   */
  getProcessingStatistics(): {
    queueSize: number;
    retryQueueSize: number;
    isProcessing: boolean;
    totalJobs: number;
  } {
    return {
      queueSize: this.processingQueue.size,
      retryQueueSize: this.retryQueue.length,
      isProcessing: this.isProcessing,
      totalJobs: this.processingQueue.size + this.retryQueue.length
    };
  }

  /**
   * Clear all queues (for testing/maintenance)
   */
  clearQueues(): void {
    this.processingQueue.clear();
    this.retryQueue.length = 0;
    console.log('Webhook processor queues cleared');
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): WebhookJob | null {
    return this.processingQueue.get(jobId) || 
           this.retryQueue.find(job => job.id === jobId) || 
           null;
  }

  /**
   * Utility function for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Process pending webhooks on startup
   */
  async processPendingWebhooks(): Promise<void> {
    try {
      console.log('Processing pending webhooks on startup...');
      const result = await webhookService.retryFailedWebhooks();
      console.log(`Startup webhook processing: ${result.processed} processed, ${result.failed} failed`);
    } catch (error) {
      console.error('Error processing pending webhooks on startup:', error);
    }
  }
}

/**
 * Webhook job interface
 */
interface WebhookJob {
  id: string;
  payload: string;
  signature: string;
  headers: Record<string, string>;
  priority: 'high' | 'normal' | 'low';
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  createdAt: Date;
  lastAttemptAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  nextRetryAt?: Date;
  error?: string;
}

// Export singleton instance
export const webhookProcessor = WebhookProcessor.getInstance();