import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma.js';

const defaultExpiryMinutes = Number(process.env.QR_TOKEN_EXPIRES_MINUTES ?? '60');

export const createQrToken = async (athleteId: string, expiresInMinutes = defaultExpiryMinutes) => {
  const athlete = await prisma.athlete.findUnique({ where: { id: athleteId } });
  if (!athlete) {
    throw new Error('Athlete not found');
  }

  const token = randomBytes(24).toString('base64url');
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  const qrToken = await prisma.qrToken.create({
    data: {
      athleteId,
      token,
      expiresAt,
    },
  });

  return {
    token: qrToken.token,
    expiresAt: qrToken.expiresAt,
  };
};

export const validateQrToken = async (token: string) => {
  const record = await prisma.qrToken.findUnique({
    where: { token },
    include: {
      athlete: {
        include: {
          user: true,
          university: true,
          sport: true,
        },
      },
    },
  });

  if (!record) {
    return { valid: false, reason: 'QR token not found' };
  }

  if (record.usedAt) {
    return { valid: false, reason: 'QR token has already been used', used: true };
  }

  if (record.expiresAt < new Date()) {
    return { valid: false, reason: 'QR token has expired', expired: true };
  }

  const athlete = record.athlete;
  const eligible = athlete.verificationStatus === 'VERIFIED' && athlete.eligibilityStatus === 'APPROVED';

  await prisma.qrToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });

  const attendanceStatus = eligible ? 'PRESENT' : 'REJECTED';
  const attendance = await prisma.attendanceRecord.create({
    data: {
      athleteId: athlete.id,
      qrTokenId: record.id,
      eventType: 'MATCH_CHECKIN',
      status: attendanceStatus,
    },
  });

  return {
    valid: true,
    athlete: {
      id: athlete.id,
      fullName: athlete.fullName,
      university: athlete.university.name,
      sport: athlete.sport.name,
      verificationStatus: athlete.verificationStatus,
      eligibilityStatus: athlete.eligibilityStatus,
    },
    eligible,
    expiresAt: record.expiresAt,
    attendance: {
      id: attendance.id,
      eventType: attendance.eventType,
      status: attendance.status,
      createdAt: attendance.createdAt,
    },
  };
};

export const listAttendanceByAthlete = async (athleteId: string) => {
  return prisma.attendanceRecord.findMany({
    where: { athleteId },
    orderBy: { createdAt: 'desc' },
    include: {
      qrToken: true,
    },
  });
};
