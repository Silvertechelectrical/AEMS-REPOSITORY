import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma.js';

export const hashPassword = async (password: string) => bcrypt.hash(password, 10);

export const comparePassword = async (password: string, hash: string) => bcrypt.compare(password, hash);

const defaultJwtExpiry = process.env.JWT_EXPIRES_IN || '3600';
export const signToken = (
  payload: Record<string, unknown>,
  expiresIn: string | number = defaultJwtExpiry,
) => {
  const options = { expiresIn } as SignOptions;
  return jwt.sign(payload, process.env.JWT_SECRET || 'development-secret', options);
};

export const issueRefreshToken = async (userId: string) => {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
};

export const revokeRefreshToken = async (token: string) => {
  await prisma.refreshToken.updateMany({
    where: {
      token,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

export const findValidRefreshToken = async (token: string) =>
  prisma.refreshToken.findFirst({
    where: {
      token,
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });
