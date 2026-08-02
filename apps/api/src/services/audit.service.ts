import { prisma } from '../lib/prisma.js';

export const createAuditLog = async (opts: {
  userId: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: any;
}) => {
  const { userId, action, resourceType, resourceId, ipAddress, userAgent, metadata } = opts;

  return prisma.auditLog.create({
    data: {
      userId: userId ?? 'system',
      action,
      resourceType,
      resourceId: resourceId ?? null,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      metadata: metadata ?? null,
    },
  });
};

export default createAuditLog;
