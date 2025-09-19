import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogEntry {
  id?: string;
  entityType: 'SUBSCRIPTION' | 'PAYMENT' | 'DOCTOR' | 'WEBHOOK';
  entityId: string;
  action: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  userId?: string;
  userType?: 'DOCTOR' | 'ADMIN' | 'SYSTEM';
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

export interface PaymentLogEntry {
  id?: string;
  paymentId: string;
  subscriptionId?: string;
  doctorId: string;
  action: 'CREATED' | 'CAPTURED' | 'FAILED' | 'REFUNDED' | 'WEBHOOK_RECEIVED';
  amount: number;
  currency: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  status: string;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  timestamp: Date;
}

export class AuditService {
  /**
   * Log subscription status changes
   */
  async logSubscriptionChange(
    subscriptionId: string,
    action: string,
    oldValues: Record<string, any> | null,
    newValues: Record<string, any>,
    userId?: string,
    userType: 'DOCTOR' | 'ADMIN' | 'SYSTEM' = 'SYSTEM',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        entityType: 'SUBSCRIPTION',
        entityId: subscriptionId,
        action,
        oldValues: oldValues || undefined,
        newValues,
        metadata,
        userId,
        userType,
        timestamp: new Date(),
        severity: this.getSeverityForAction(action)
      };

      await this.createAuditLog(auditEntry);
      
      console.log(`Subscription audit log created: ${action} for subscription ${subscriptionId}`);
    } catch (error) {
      console.error('Error creating subscription audit log:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Log payment transactions with security considerations
   */
  async logPaymentTransaction(
    paymentId: string,
    action: 'CREATED' | 'CAPTURED' | 'FAILED' | 'REFUNDED' | 'WEBHOOK_RECEIVED',
    details: {
      subscriptionId?: string;
      doctorId: string;
      amount: number;
      currency: string;
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      status: string;
      errorCode?: string;
      errorMessage?: string;
      metadata?: Record<string, any>;
      ipAddress?: string;
    }
  ): Promise<void> {
    try {
      const paymentLogEntry: PaymentLogEntry = {
        paymentId,
        action,
        timestamp: new Date(),
        ...details
      };

      await this.createPaymentLog(paymentLogEntry);
      
      // Also create audit log for payment events
      await this.createAuditLog({
        entityType: 'PAYMENT',
        entityId: paymentId,
        action,
        newValues: {
          amount: details.amount,
          currency: details.currency,
          status: details.status,
          razorpayPaymentId: details.razorpayPaymentId
        },
        metadata: {
          subscriptionId: details.subscriptionId,
          errorCode: details.errorCode,
          errorMessage: details.errorMessage
        },
        userId: details.doctorId,
        userType: 'DOCTOR',
        ipAddress: details.ipAddress,
        timestamp: new Date(),
        severity: action === 'FAILED' ? 'ERROR' : 'INFO'
      });

      console.log(`Payment transaction logged: ${action} for payment ${paymentId}`);
    } catch (error) {
      console.error('Error logging payment transaction:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Log webhook events
   */
  async logWebhookEvent(
    webhookId: string,
    event: string,
    payload: Record<string, any>,
    status: 'RECEIVED' | 'PROCESSED' | 'FAILED',
    errorMessage?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.createAuditLog({
        entityType: 'WEBHOOK',
        entityId: webhookId,
        action: `WEBHOOK_${event.toUpperCase()}`,
        newValues: {
          event,
          status,
          payloadSize: JSON.stringify(payload).length
        },
        metadata: {
          ...metadata,
          errorMessage,
          // Store sanitized payload (remove sensitive data)
          payload: this.sanitizeWebhookPayload(payload)
        },
        userType: 'SYSTEM',
        timestamp: new Date(),
        severity: status === 'FAILED' ? 'ERROR' : 'INFO'
      });

      console.log(`Webhook event logged: ${event} with status ${status}`);
    } catch (error) {
      console.error('Error logging webhook event:', error);
    }
  }

  /**
   * Log system errors
   */
  async logError(
    entityType: 'SUBSCRIPTION' | 'PAYMENT' | 'WEBHOOK' | 'SYSTEM',
    entityId: string,
    error: Error,
    context?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    try {
      await this.createAuditLog({
        entityType,
        entityId,
        action: 'ERROR',
        newValues: {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack
        },
        metadata: context,
        userId,
        userType: userId ? 'DOCTOR' : 'SYSTEM',
        timestamp: new Date(),
        severity: 'ERROR'
      });

      console.error(`Error logged for ${entityType} ${entityId}:`, error.message);
    } catch (logError) {
      console.error('Error creating error log:', logError);
    }
  }

  /**
   * Get audit logs for an entity
   */
  async getAuditLogs(
    entityType?: string,
    entityId?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLogEntry[]> {
    try {
      // In a real implementation, you would query from an audit_logs table
      // For now, we'll return mock data
      console.log(`Fetching audit logs for ${entityType} ${entityId}`);
      return [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  /**
   * Get payment logs for analysis
   */
  async getPaymentLogs(
    doctorId?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<PaymentLogEntry[]> {
    try {
      // In a real implementation, you would query from a payment_logs table
      console.log(`Fetching payment logs for doctor ${doctorId}`);
      return [];
    } catch (error) {
      console.error('Error fetching payment logs:', error);
      return [];
    }
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      // In a real implementation, you would insert into an audit_logs table
      // For now, we'll log to console and could store in a file or external service
      
      const logMessage = {
        timestamp: entry.timestamp.toISOString(),
        severity: entry.severity,
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        userId: entry.userId,
        userType: entry.userType,
        oldValues: entry.oldValues,
        newValues: entry.newValues,
        metadata: entry.metadata,
        ipAddress: entry.ipAddress
      };

      // Log to console (in production, you'd use a proper logging service)
      console.log('AUDIT_LOG:', JSON.stringify(logMessage));

      // In a real implementation:
      // await prisma.auditLog.create({ data: entry });
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }

  /**
   * Create payment log entry
   */
  private async createPaymentLog(entry: PaymentLogEntry): Promise<void> {
    try {
      // In a real implementation, you would insert into a payment_logs table
      
      const logMessage = {
        timestamp: entry.timestamp.toISOString(),
        paymentId: entry.paymentId,
        subscriptionId: entry.subscriptionId,
        doctorId: entry.doctorId,
        action: entry.action,
        amount: entry.amount,
        currency: entry.currency,
        razorpayPaymentId: entry.razorpayPaymentId,
        razorpayOrderId: entry.razorpayOrderId,
        status: entry.status,
        errorCode: entry.errorCode,
        errorMessage: entry.errorMessage,
        metadata: entry.metadata,
        ipAddress: entry.ipAddress
      };

      // Log to console (in production, you'd use a proper logging service)
      console.log('PAYMENT_LOG:', JSON.stringify(logMessage));

      // In a real implementation:
      // await prisma.paymentLog.create({ data: entry });
    } catch (error) {
      console.error('Error creating payment log:', error);
    }
  }

  /**
   * Get severity level for action
   */
  private getSeverityForAction(action: string): 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' {
    const errorActions = ['FAILED', 'ERROR', 'CANCELLED', 'REJECTED'];
    const warningActions = ['EXPIRED', 'SUSPENDED', 'GRACE_PERIOD'];
    
    if (errorActions.some(a => action.includes(a))) {
      return 'ERROR';
    }
    
    if (warningActions.some(a => action.includes(a))) {
      return 'WARNING';
    }
    
    return 'INFO';
  }

  /**
   * Sanitize webhook payload to remove sensitive data
   */
  private sanitizeWebhookPayload(payload: Record<string, any>): Record<string, any> {
    const sensitiveFields = ['signature', 'key', 'secret', 'token', 'password'];
    const sanitized = { ...payload };
    
    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }
      
      const result: any = Array.isArray(obj) ? [] : {};
      
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }
      
      return result;
    };
    
    return sanitizeObject(sanitized);
  }

  /**
   * Clean up old logs (for maintenance)
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<{ deletedAuditLogs: number; deletedPaymentLogs: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      // In a real implementation, you would delete old records
      console.log(`Cleaning up logs older than ${cutoffDate.toISOString()}`);
      
      return {
        deletedAuditLogs: 0,
        deletedPaymentLogs: 0
      };
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
      return {
        deletedAuditLogs: 0,
        deletedPaymentLogs: 0
      };
    }
  }
}

export const auditService = new AuditService();