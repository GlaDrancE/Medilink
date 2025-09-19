import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NotificationService } from '../services/notification.service';
import { PrismaClient, SubscriptionStatus } from '@prisma/client';

// Mock Prisma
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    subscription: {
      findMany: vi.fn(),
    },
    doctor: {
      findUnique: vi.fn(),
    },
  })),
  SubscriptionStatus: {
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED',
    CANCELLED: 'CANCELLED',
  },
}));

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    notificationService = new NotificationService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDoctorsWithExpiringSubscriptions', () => {
    it('should return doctors with subscriptions expiring within specified days', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          doctorId: 'doc-1',
          plan: 'MONTHLY',
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          doctor: {
            id: 'doc-1',
            name: 'Dr. John Doe',
            email: 'john@example.com',
          },
        },
      ];

      mockPrisma.subscription.findMany.mockResolvedValue(mockSubscriptions);

      const result = await notificationService.getDoctorsWithExpiringSubscriptions(7);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        doctorId: 'doc-1',
        subscriptionId: 'sub-1',
        doctorName: 'Dr. John Doe',
        doctorEmail: 'john@example.com',
        plan: 'MONTHLY',
        daysUntilExpiry: 3,
      });

      expect(mockPrisma.subscription.findMany).toHaveBeenCalledWith({
        where: {
          status: SubscriptionStatus.ACTIVE,
          endDate: {
            lte: expect.any(Date),
            gte: expect.any(Date),
          },
        },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('should handle empty results', async () => {
      mockPrisma.subscription.findMany.mockResolvedValue([]);

      const result = await notificationService.getDoctorsWithExpiringSubscriptions(7);

      expect(result).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      mockPrisma.subscription.findMany.mockRejectedValue(new Error('Database error'));

      await expect(
        notificationService.getDoctorsWithExpiringSubscriptions(7)
      ).rejects.toThrow('Failed to fetch expiring subscriptions');
    });
  });

  describe('getDoctorsInGracePeriod', () => {
    it('should return doctors with expired subscriptions in grace period', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          doctorId: 'doc-1',
          plan: 'MONTHLY',
          endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          doctor: {
            id: 'doc-1',
            name: 'Dr. Jane Doe',
            email: 'jane@example.com',
          },
        },
      ];

      mockPrisma.subscription.findMany.mockResolvedValue(mockSubscriptions);

      const result = await notificationService.getDoctorsInGracePeriod();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        doctorId: 'doc-1',
        subscriptionId: 'sub-1',
        doctorName: 'Dr. Jane Doe',
        doctorEmail: 'jane@example.com',
        plan: 'MONTHLY',
        daysExpired: 2,
      });

      expect(mockPrisma.subscription.findMany).toHaveBeenCalledWith({
        where: {
          status: SubscriptionStatus.EXPIRED,
          endDate: {
            gte: expect.any(Date),
            lt: expect.any(Date),
          },
        },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });
  });

  describe('sendExpiryWarning', () => {
    it('should send expiry warning successfully', async () => {
      const mockDoctor = {
        name: 'Dr. John Doe',
        email: 'john@example.com',
      };

      mockPrisma.doctor.findUnique.mockResolvedValue(mockDoctor);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await notificationService.sendExpiryWarning(
        'doc-1',
        'sub-1',
        3,
        'EMAIL'
      );

      expect(result).toBe(true);
      expect(mockPrisma.doctor.findUnique).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
        select: { name: true, email: true },
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sending EMAIL notification to john@example.com:'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it('should handle doctor not found', async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue(null);

      const result = await notificationService.sendExpiryWarning(
        'invalid-doc-id',
        'sub-1',
        3,
        'EMAIL'
      );

      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      mockPrisma.doctor.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await notificationService.sendExpiryWarning(
        'doc-1',
        'sub-1',
        3,
        'EMAIL'
      );

      expect(result).toBe(false);
    });
  });

  describe('processExpiryReminders', () => {
    it('should process all expiry reminders successfully', async () => {
      const mockExpiringSubscriptions = [
        {
          doctorId: 'doc-1',
          subscriptionId: 'sub-1',
          daysUntilExpiry: 7,
        },
        {
          doctorId: 'doc-2',
          subscriptionId: 'sub-2',
          daysUntilExpiry: 3,
        },
      ];

      const mockGracePeriodSubscriptions = [
        {
          doctorId: 'doc-3',
          subscriptionId: 'sub-3',
          daysExpired: 2,
        },
      ];

      // Mock the methods
      vi.spyOn(notificationService, 'getDoctorsWithExpiringSubscriptions')
        .mockResolvedValueOnce(mockExpiringSubscriptions.filter(s => s.daysUntilExpiry === 7))
        .mockResolvedValueOnce(mockExpiringSubscriptions.filter(s => s.daysUntilExpiry === 3))
        .mockResolvedValueOnce([]);

      vi.spyOn(notificationService, 'getDoctorsInGracePeriod')
        .mockResolvedValue(mockGracePeriodSubscriptions);

      vi.spyOn(notificationService, 'sendExpiryWarning')
        .mockResolvedValue(true);

      vi.spyOn(notificationService, 'sendGracePeriodNotification')
        .mockResolvedValue(true);

      const result = await notificationService.processExpiryReminders();

      expect(result).toEqual({
        processed: 3,
        successful: 3,
        failed: 0,
      });
    });

    it('should handle partial failures', async () => {
      vi.spyOn(notificationService, 'getDoctorsWithExpiringSubscriptions')
        .mockResolvedValueOnce([{ doctorId: 'doc-1', subscriptionId: 'sub-1', daysUntilExpiry: 7 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      vi.spyOn(notificationService, 'getDoctorsInGracePeriod')
        .mockResolvedValue([]);

      vi.spyOn(notificationService, 'sendExpiryWarning')
        .mockResolvedValue(false); // Simulate failure

      const result = await notificationService.processExpiryReminders();

      expect(result).toEqual({
        processed: 1,
        successful: 0,
        failed: 1,
      });
    });
  });

  describe('getDashboardNotifications', () => {
    it('should return expiry warning for active subscription expiring soon', async () => {
      const mockDoctor = {
        id: 'doc-1',
        subscriptions: [
          {
            id: 'sub-1',
            status: SubscriptionStatus.ACTIVE,
            endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          },
        ],
      };

      mockPrisma.doctor.findUnique.mockResolvedValue(mockDoctor);

      const result = await notificationService.getDashboardNotifications('doc-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'warning',
        title: 'Subscription Expiring Soon',
        message: 'Your subscription expires in 3 days',
        actionText: 'Renew Now',
        actionUrl: '/subscription',
      });
    });

    it('should return grace period notification for expired subscription', async () => {
      const mockDoctor = {
        id: 'doc-1',
        subscriptions: [
          {
            id: 'sub-1',
            status: SubscriptionStatus.EXPIRED,
            endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          },
        ],
      };

      mockPrisma.doctor.findUnique.mockResolvedValue(mockDoctor);

      const result = await notificationService.getDashboardNotifications('doc-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'error',
        title: 'Subscription Expired',
        message: 'Your subscription expired 2 days ago. You have 5 days left in your grace period.',
        actionText: 'Renew Now',
        actionUrl: '/subscription',
      });
    });

    it('should return empty array for doctor with no subscriptions', async () => {
      const mockDoctor = {
        id: 'doc-1',
        subscriptions: [],
      };

      mockPrisma.doctor.findUnique.mockResolvedValue(mockDoctor);

      const result = await notificationService.getDashboardNotifications('doc-1');

      expect(result).toHaveLength(0);
    });

    it('should return empty array for doctor not found', async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue(null);

      const result = await notificationService.getDashboardNotifications('invalid-doc-id');

      expect(result).toHaveLength(0);
    });
  });

  describe('getNotificationPreferences', () => {
    it('should return default preferences', async () => {
      const result = await notificationService.getNotificationPreferences('doc-1');

      expect(result).toEqual({
        emailNotifications: true,
        smsNotifications: true,
        expiryReminders: true,
        paymentReceipts: true,
        featureUpdates: false,
      });
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update preferences successfully', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await notificationService.updateNotificationPreferences('doc-1', {
        emailNotifications: false,
        featureUpdates: true,
      });

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Updating notification preferences for doctor doc-1:',
        { emailNotifications: false, featureUpdates: true }
      );

      consoleSpy.mockRestore();
    });
  });
});