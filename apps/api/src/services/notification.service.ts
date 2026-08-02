import { prisma } from '../lib/prisma.js';

export const createNotification = async (userId: string, title: string, message: string, type: 'INFO' | 'WARNING' | 'ACTION_REQUIRED' = 'INFO', metadata?: any) => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      metadata: metadata ?? null,
    },
  });
};

export const listNotificationsForUser = async (userId: string) => {
  return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
};

export const markNotificationRead = async (id: string) => {
  return prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
};

export default createNotification;
