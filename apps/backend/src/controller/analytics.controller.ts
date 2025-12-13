import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';
import { auditService } from '../services/audit.service';

export class AnalyticsController {
  /**
   * Get subscription metrics
   */
  async getSubscriptionMetrics(req: Request, res: Response): Promise<void> {
    try {
      // In a real implementation, you would check for admin role
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const metrics = await analyticsService.getSubscriptionMetrics(start, end);

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Error getting subscription metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subscription metrics'
      });
    }
  }

  /**
   * Get payment metrics
   */
  async getPaymentMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const metrics = await analyticsService.getPaymentMetrics(start, end);

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Error getting payment metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get payment metrics'
      });
    }
  }

  /**
   * Get churn analysis
   */
  async getChurnAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const months = parseInt(req.query.months as string) || 12;
      
      const analysis = await analyticsService.getChurnAnalysis(months);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error getting churn analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get churn analysis'
      });
    }
  }

  /**
   * Get revenue analysis
   */
  async getRevenueAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const months = parseInt(req.query.months as string) || 12;
      
      const analysis = await analyticsService.getRevenueAnalysis(months);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error getting revenue analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get revenue analysis'
      });
    }
  }

  /**
   * Get cohort analysis
   */
  async getCohortAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const months = parseInt(req.query.months as string) || 6;
      
      const analysis = await analyticsService.getCohortAnalysis(months);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error getting cohort analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get cohort analysis'
      });
    }
  }

  /**
   * Get admin dashboard summary
   */
  async getAdminDashboard(req: Request, res: Response): Promise<void> {
    try {
      const summary = await analyticsService.getAdminDashboardSummary();

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error getting admin dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get admin dashboard data'
      });
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const format = (req.query.format as 'json' | 'csv') || 'json';
      
      const data = await analyticsService.exportAnalyticsData(format);

      const filename = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
      
      res.send(data);
    } catch (error) {
      console.error('Error exporting analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export analytics data'
      });
    }
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const { entityType, entityId, limit = 100, offset = 0 } = req.query;
      
      const logs = await auditService.getAuditLogs(
        entityType as string,
        entityId as string,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            total: logs.length
          }
        }
      });
    } catch (error) {
      console.error('Error getting audit logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get audit logs'
      });
    }
  }

  /**
   * Get payment logs
   */
  async getPaymentLogs(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId, startDate, endDate, limit = 100 } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const logs = await auditService.getPaymentLogs(
        doctorId as string,
        start,
        end,
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: {
          logs,
          count: logs.length
        }
      });
    } catch (error) {
      console.error('Error getting payment logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get payment logs'
      });
    }
  }

  /**
   * Clean up old logs
   */
  async cleanupLogs(req: Request, res: Response): Promise<void> {
    try {
      const daysToKeep = parseInt(req.body.daysToKeep) || 90;
      
      const result = await auditService.cleanupOldLogs(daysToKeep);

      res.json({
        success: true,
        data: result,
        message: `Cleaned up logs older than ${daysToKeep} days`
      });
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clean up logs'
      });
    }
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth(req: Request, res: Response): Promise<void> {
    try {
      // In a real implementation, you would check various system metrics
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'healthy',
          payment_gateway: 'healthy',
          notification_service: 'healthy',
          background_jobs: 'healthy'
        },
        metrics: {
          uptime: process.uptime(),
          memory_usage: process.memoryUsage(),
          cpu_usage: process.cpuUsage()
        }
      };

      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      console.error('Error getting system health:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get system health'
      });
    }
  }
}

export const analyticsController = new AnalyticsController();