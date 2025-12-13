import { PrismaClient, SubscriptionStatus, SubscriptionPlan } from '@prisma/client';

const prisma = new PrismaClient();

export interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  monthlySubscriptions: number;
  yearlySubscriptions: number;
  newSubscriptionsThisMonth: number;
  churnedSubscriptionsThisMonth: number;
  churnRate: number;
  renewalRate: number;
  averageLifetimeValue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
}

export interface PaymentMetrics {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  totalRevenue: number;
  displayTotalRevenue: string;
  averageOrderValue: number;
  displayAverageOrderValue: string;
  successRate: number;
  monthlyRevenue: number;
  displayMonthlyRevenue: string;
  yearlyRevenue: number;
  displayYearlyRevenue: string;
}

export interface ChurnAnalysis {
  totalChurned: number;
  churnRate: number;
  churnReasons: Record<string, number>;
  churnByPlan: Record<string, number>;
  averageDaysToChurn: number;
  recoveredSubscriptions: number;
}

export interface RevenueAnalysis {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  mrrGrowthRate: number;
  revenueByPlan: Record<string, number>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  averageRevenuePerUser: number;
  lifetimeValue: number;
}

export interface CohortAnalysis {
  cohortMonth: string;
  initialUsers: number;
  retentionRates: number[]; // Retention rates for each month
  revenueRetention: number[];
}

export class AnalyticsService {
  /**
   * Get comprehensive subscription metrics
   */
  async getSubscriptionMetrics(startDate?: Date, endDate?: Date): Promise<SubscriptionMetrics> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get all subscriptions
      const allSubscriptions = await prisma.subscription.findMany({
        where: startDate && endDate ? {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        } : undefined,
        include: {
          payments: true
        }
      });

      // Calculate basic counts
      const totalSubscriptions = allSubscriptions.length;
      const activeSubscriptions = allSubscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE).length;
      const expiredSubscriptions = allSubscriptions.filter(s => s.status === SubscriptionStatus.EXPIRED).length;
      const cancelledSubscriptions = allSubscriptions.filter(s => s.status === SubscriptionStatus.CANCELLED).length;
      const monthlySubscriptions = allSubscriptions.filter(s => s.plan === SubscriptionPlan.MONTHLY).length;
      const yearlySubscriptions = allSubscriptions.filter(s => s.plan === SubscriptionPlan.YEARLY).length;

      // New subscriptions this month
      const newSubscriptionsThisMonth = allSubscriptions.filter(s => 
        s.createdAt >= startOfMonth && s.createdAt <= endOfMonth
      ).length;

      // Churned subscriptions this month (cancelled or expired)
      const churnedSubscriptionsThisMonth = allSubscriptions.filter(s => 
        (s.status === SubscriptionStatus.CANCELLED || s.status === SubscriptionStatus.EXPIRED) &&
        s.updatedAt >= startOfMonth && s.updatedAt <= endOfMonth
      ).length;

      // Calculate churn rate
      const activeLastMonth = allSubscriptions.filter(s => 
        s.createdAt <= endOfLastMonth && 
        (s.status === SubscriptionStatus.ACTIVE || 
         (s.status !== SubscriptionStatus.ACTIVE && s.updatedAt > endOfLastMonth))
      ).length;

      const churnRate = activeLastMonth > 0 ? (churnedSubscriptionsThisMonth / activeLastMonth) * 100 : 0;

      // Calculate renewal rate
      const renewedSubscriptions = allSubscriptions.filter(s => 
        s.payments.some(p => 
          p.createdAt >= startOfMonth && 
          p.createdAt <= endOfMonth && 
          p.status === 'captured'
        )
      ).length;

      const renewalRate = activeLastMonth > 0 ? (renewedSubscriptions / activeLastMonth) * 100 : 0;

      // Calculate average lifetime value
      const totalRevenue = allSubscriptions.reduce((sum, s) => 
        sum + s.payments.filter(p => p.status === 'captured').reduce((pSum, p) => pSum + p.amount, 0), 0
      );
      const averageLifetimeValue = totalSubscriptions > 0 ? totalRevenue / totalSubscriptions : 0;

      // Calculate MRR and ARR
      const monthlyRevenue = activeSubscriptions * 99; // ₹99 per month
      const yearlyRevenue = yearlySubscriptions * 999; // ₹999 per year converted to monthly
      const monthlyRecurringRevenue = monthlyRevenue + (yearlyRevenue / 12);
      const annualRecurringRevenue = monthlyRecurringRevenue * 12;

      return {
        totalSubscriptions,
        activeSubscriptions,
        expiredSubscriptions,
        cancelledSubscriptions,
        monthlySubscriptions,
        yearlySubscriptions,
        newSubscriptionsThisMonth,
        churnedSubscriptionsThisMonth,
        churnRate: Math.round(churnRate * 100) / 100,
        renewalRate: Math.round(renewalRate * 100) / 100,
        averageLifetimeValue: Math.round(averageLifetimeValue / 100), // Convert paise to rupees
        monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue / 100),
        annualRecurringRevenue: Math.round(annualRecurringRevenue / 100)
      };
    } catch (error) {
      console.error('Error calculating subscription metrics:', error);
      throw new Error('Failed to calculate subscription metrics');
    }
  }

  /**
   * Get payment metrics and analytics
   */
  async getPaymentMetrics(startDate?: Date, endDate?: Date): Promise<PaymentMetrics> {
    try {
      const payments = await prisma.paymentTransaction.findMany({
        where: startDate && endDate ? {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        } : undefined
      });

      const totalPayments = payments.length;
      const successfulPayments = payments.filter(p => p.status === 'captured').length;
      const failedPayments = payments.filter(p => p.status === 'failed').length;
      
      const totalRevenue = payments
        .filter(p => p.status === 'captured')
        .reduce((sum, p) => sum + p.amount, 0);

      const averageOrderValue = successfulPayments > 0 ? totalRevenue / successfulPayments : 0;
      const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

      // Monthly and yearly revenue
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const monthlyRevenue = payments
        .filter(p => p.status === 'captured' && p.createdAt >= startOfMonth)
        .reduce((sum, p) => sum + p.amount, 0);

      const yearlyRevenue = payments
        .filter(p => p.status === 'captured' && p.createdAt >= startOfYear)
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        totalPayments,
        successfulPayments,
        failedPayments,
        totalRevenue: Math.round(totalRevenue / 100), // Convert paise to rupees
        displayTotalRevenue: `₹${Math.round(totalRevenue / 100).toLocaleString()}`,
        averageOrderValue: Math.round(averageOrderValue / 100),
        displayAverageOrderValue: `₹${Math.round(averageOrderValue / 100)}`,
        successRate: Math.round(successRate * 100) / 100,
        monthlyRevenue: Math.round(monthlyRevenue / 100),
        displayMonthlyRevenue: `₹${Math.round(monthlyRevenue / 100).toLocaleString()}`,
        yearlyRevenue: Math.round(yearlyRevenue / 100),
        displayYearlyRevenue: `₹${Math.round(yearlyRevenue / 100).toLocaleString()}`
      };
    } catch (error) {
      console.error('Error calculating payment metrics:', error);
      throw new Error('Failed to calculate payment metrics');
    }
  }

  /**
   * Analyze churn patterns
   */
  async getChurnAnalysis(months: number = 12): Promise<ChurnAnalysis> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - months);

      const churnedSubscriptions = await prisma.subscription.findMany({
        where: {
          OR: [
            { status: SubscriptionStatus.CANCELLED },
            { status: SubscriptionStatus.EXPIRED }
          ],
          updatedAt: {
            gte: cutoffDate
          }
        },
        include: {
          payments: true
        }
      });

      const totalChurned = churnedSubscriptions.length;

      // Calculate churn rate
      const totalActiveInPeriod = await prisma.subscription.count({
        where: {
          createdAt: {
            lte: cutoffDate
          }
        }
      });

      const churnRate = totalActiveInPeriod > 0 ? (totalChurned / totalActiveInPeriod) * 100 : 0;

      // Analyze churn by plan
      const churnByPlan = churnedSubscriptions.reduce((acc, sub) => {
        acc[sub.plan] = (acc[sub.plan] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate average days to churn
      const daysToChurn = churnedSubscriptions.map(sub => {
        const daysDiff = Math.floor((sub.updatedAt.getTime() - sub.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff;
      });

      const averageDaysToChurn = daysToChurn.length > 0 
        ? daysToChurn.reduce((sum, days) => sum + days, 0) / daysToChurn.length 
        : 0;

      // Mock churn reasons (in a real implementation, you'd track this)
      const churnReasons = {
        'Price too high': Math.floor(totalChurned * 0.3),
        'Not using features': Math.floor(totalChurned * 0.25),
        'Found alternative': Math.floor(totalChurned * 0.2),
        'Technical issues': Math.floor(totalChurned * 0.15),
        'Other': Math.floor(totalChurned * 0.1)
      };

      // Mock recovered subscriptions
      const recoveredSubscriptions = Math.floor(totalChurned * 0.1);

      return {
        totalChurned,
        churnRate: Math.round(churnRate * 100) / 100,
        churnReasons,
        churnByPlan,
        averageDaysToChurn: Math.round(averageDaysToChurn),
        recoveredSubscriptions
      };
    } catch (error) {
      console.error('Error analyzing churn:', error);
      throw new Error('Failed to analyze churn');
    }
  }

  /**
   * Get revenue analysis and trends
   */
  async getRevenueAnalysis(months: number = 12): Promise<RevenueAnalysis> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - months);

      const payments = await prisma.paymentTransaction.findMany({
        where: {
          status: 'captured',
          createdAt: {
            gte: cutoffDate
          }
        },
        include: {
          subscription: true
        }
      });

      // Calculate MRR and ARR
      const activeSubscriptions = await prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE
        }
      });

      const monthlyRevenue = activeSubscriptions
        .filter(s => s.plan === SubscriptionPlan.MONTHLY)
        .length * 99;

      const yearlyRevenue = activeSubscriptions
        .filter(s => s.plan === SubscriptionPlan.YEARLY)
        .length * 999;

      const mrr = (monthlyRevenue + (yearlyRevenue / 12)) / 100; // Convert to rupees
      const arr = mrr * 12;

      // Calculate MRR growth rate
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

      const lastMonthActiveSubscriptions = await prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          createdAt: {
            lte: lastMonthDate
          }
        }
      });

      const lastMonthMrr = (
        lastMonthActiveSubscriptions.filter(s => s.plan === SubscriptionPlan.MONTHLY).length * 99 +
        (lastMonthActiveSubscriptions.filter(s => s.plan === SubscriptionPlan.YEARLY).length * 999 / 12)
      ) / 100;

      const mrrGrowthRate = lastMonthMrr > 0 ? ((mrr - lastMonthMrr) / lastMonthMrr) * 100 : 0;

      // Revenue by plan
      const revenueByPlan = payments.reduce((acc, payment) => {
        const plan = payment.subscription?.plan || 'UNKNOWN';
        acc[plan] = (acc[plan] || 0) + (payment.amount / 100);
        return acc;
      }, {} as Record<string, number>);

      // Revenue by month
      const revenueByMonth = [];
      for (let i = months - 1; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        const monthRevenue = payments
          .filter(p => p.createdAt >= monthStart && p.createdAt <= monthEnd)
          .reduce((sum, p) => sum + p.amount, 0) / 100;

        revenueByMonth.push({
          month: monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          revenue: monthRevenue
        });
      }

      // Calculate ARPU and LTV
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0) / 100;
      const uniqueUsers = new Set(payments.map(p => p.subscription?.doctorId).filter(Boolean)).size;
      const averageRevenuePerUser = uniqueUsers > 0 ? totalRevenue / uniqueUsers : 0;

      // Estimate lifetime value (simplified calculation)
      const averageChurnRate = 0.05; // 5% monthly churn rate (mock)
      const lifetimeValue = averageChurnRate > 0 ? mrr / (uniqueUsers * averageChurnRate) : 0;

      return {
        mrr: Math.round(mrr),
        arr: Math.round(arr),
        mrrGrowthRate: Math.round(mrrGrowthRate * 100) / 100,
        revenueByPlan,
        revenueByMonth,
        averageRevenuePerUser: Math.round(averageRevenuePerUser),
        lifetimeValue: Math.round(lifetimeValue)
      };
    } catch (error) {
      console.error('Error analyzing revenue:', error);
      throw new Error('Failed to analyze revenue');
    }
  }

  /**
   * Get cohort analysis for retention
   */
  async getCohortAnalysis(cohortMonths: number = 6): Promise<CohortAnalysis[]> {
    try {
      const cohorts: CohortAnalysis[] = [];

      for (let i = cohortMonths - 1; i >= 0; i--) {
        const cohortDate = new Date();
        cohortDate.setMonth(cohortDate.getMonth() - i);
        const cohortStart = new Date(cohortDate.getFullYear(), cohortDate.getMonth(), 1);
        const cohortEnd = new Date(cohortDate.getFullYear(), cohortDate.getMonth() + 1, 0);

        // Get users who started in this cohort month
        const cohortUsers = await prisma.subscription.findMany({
          where: {
            createdAt: {
              gte: cohortStart,
              lte: cohortEnd
            }
          }
        });

        const initialUsers = cohortUsers.length;
        const retentionRates: number[] = [];
        const revenueRetention: number[] = [];

        // Calculate retention for each subsequent month
        for (let month = 0; month <= i; month++) {
          const checkDate = new Date(cohortStart);
          checkDate.setMonth(checkDate.getMonth() + month);
          const checkEnd = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0);

          const activeUsers = cohortUsers.filter(user => {
            return user.status === SubscriptionStatus.ACTIVE || 
                   (user.endDate && user.endDate > checkEnd);
          }).length;

          const retentionRate = initialUsers > 0 ? (activeUsers / initialUsers) * 100 : 0;
          retentionRates.push(Math.round(retentionRate * 100) / 100);

          // Calculate revenue retention (simplified)
          const revenueRate = retentionRate * 0.9; // Assume 90% of retained users generate revenue
          revenueRetention.push(Math.round(revenueRate * 100) / 100);
        }

        cohorts.push({
          cohortMonth: cohortStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          initialUsers,
          retentionRates,
          revenueRetention
        });
      }

      return cohorts;
    } catch (error) {
      console.error('Error calculating cohort analysis:', error);
      throw new Error('Failed to calculate cohort analysis');
    }
  }

  /**
   * Get admin dashboard summary
   */
  async getAdminDashboardSummary(): Promise<{
    subscriptionMetrics: SubscriptionMetrics;
    paymentMetrics: PaymentMetrics;
    churnAnalysis: ChurnAnalysis;
    revenueAnalysis: RevenueAnalysis;
  }> {
    try {
      const [subscriptionMetrics, paymentMetrics, churnAnalysis, revenueAnalysis] = await Promise.all([
        this.getSubscriptionMetrics(),
        this.getPaymentMetrics(),
        this.getChurnAnalysis(),
        this.getRevenueAnalysis()
      ]);

      return {
        subscriptionMetrics,
        paymentMetrics,
        churnAnalysis,
        revenueAnalysis
      };
    } catch (error) {
      console.error('Error getting admin dashboard summary:', error);
      throw new Error('Failed to get admin dashboard summary');
    }
  }

  /**
   * Export analytics data for reporting
   */
  async exportAnalyticsData(format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const summary = await this.getAdminDashboardSummary();
      
      if (format === 'json') {
        return JSON.stringify(summary, null, 2);
      } else {
        // Convert to CSV format (simplified)
        const csvData = [
          'Metric,Value',
          `Total Subscriptions,${summary.subscriptionMetrics.totalSubscriptions}`,
          `Active Subscriptions,${summary.subscriptionMetrics.activeSubscriptions}`,
          `Monthly Recurring Revenue,${summary.subscriptionMetrics.monthlyRecurringRevenue}`,
          `Churn Rate,${summary.churnAnalysis.churnRate}%`,
          `Total Revenue,${summary.paymentMetrics.displayTotalRevenue}`,
          `Payment Success Rate,${summary.paymentMetrics.successRate}%`
        ].join('\n');
        
        return csvData;
      }
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw new Error('Failed to export analytics data');
    }
  }
}

export const analyticsService = new AnalyticsService();