import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { DEFAULT_PUBLIC_ROLE, isValidRole } from '../constants/roles.js';
import { comparePassword, findValidRefreshToken, hashPassword, issueRefreshToken, revokeRefreshToken, signToken } from '../services/auth.service.js';
import { ok } from '../utils/response.js';

const OFFICER_ROLES = ['UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH'] as const;
const CAPTAIN_ROLE = 'TEAM_CAPTAIN';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if ('approved' in user && !user.approved) {
    return res.status(403).json({ message: 'Account is pending approval' });
  }

  const token = signToken({ sub: user.id, role: user.role, universityId: user.universityId });
  const refreshToken = await issueRefreshToken(user.id);

  return res.json(
    ok({
      token,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }),
  );
};

export const register = async (_req: Request, res: Response) => {
  return res.status(403).json({
    message: 'Public athlete self-registration is disabled. Athlete accounts must be created by authorised AEMS staff after university verification.',
  });
};

export const listPendingApprovals = async (_req: Request, res: Response) => {
  const pendingUsers = await prisma.user.findMany({
    where: { approved: false as any },
    select: { id: true, name: true, email: true, role: true, universityId: true, createdAt: true },
  });

  return res.json(ok(pendingUsers));
};

export const registerCaptain = async (req: Request, res: Response) => {
  const { name, email, password, universityId: requestedUniversityId } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    universityId?: string;
  };

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const requestingUser = req.user;
  let universityId = requestedUniversityId;

  if (requestingUser?.role === 'SPORTS_OFFICER' || requestingUser?.role === 'UNIVERSITY_ADMIN') {
    if (!requestingUser.universityId) {
      return res.status(400).json({ message: 'Your account is not linked to a university' });
    }

    if (requestedUniversityId && requestedUniversityId !== requestingUser.universityId) {
      return res.status(403).json({ message: 'You can only create captains for your own university' });
    }

    universityId = requestingUser.universityId;
  }

  if (!universityId) {
    return res.status(400).json({ message: 'UniversityId is required for captain registration' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const university = await prisma.university.findUnique({ where: { id: universityId } });
  if (!university) {
    return res.status(404).json({ message: 'University not found' });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: CAPTAIN_ROLE,
      universityId,
      approved: true,
    },
  });

  const token = signToken({ sub: user.id, role: user.role, universityId: user.universityId });
  const refreshToken = await issueRefreshToken(user.id);

  return res.status(201).json(
    ok({
      token,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }),
  );
};

export const inviteOfficer = async (req: Request, res: Response) => {
  const { name, email, role, universityId } = req.body as {
    name?: string;
    email?: string;
    role?: string;
    universityId?: string;
  };

  if (!name || !email || !role || !universityId) {
    return res.status(400).json({ message: 'Name, email, role, and universityId are required' });
  }

  const normalizedRole = role.toUpperCase();
  if (!isValidRole(normalizedRole) || !OFFICER_ROLES.includes(normalizedRole as typeof OFFICER_ROLES[number])) {
    return res.status(403).json({ message: 'Invalid officer role. Allowed roles: UNIVERSITY_ADMIN, SPORTS_OFFICER, COACH' });
  }

  const university = await prisma.university.findUnique({ where: { id: universityId } });
  if (!university) {
    return res.status(404).json({ message: 'University not found' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const placeholderPassword = await hashPassword(Math.random().toString(36).slice(2, 12));

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: placeholderPassword,
      role: normalizedRole as typeof OFFICER_ROLES[number],
      universityId,
      approved: false,
    },
  });

  return res.status(201).json(ok({ invitedUser: { id: user.id, name: user.name, email: user.email, role: user.role, universityId: user.universityId } }));
};

export const approveUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.approved) {
    return res.status(400).json({ message: 'User is already approved' });
  }

  const approved = await prisma.user.update({ where: { id }, data: { approved: true as any } });

  return res.json(ok({ approved: { id: approved.id, email: approved.email, role: approved.role, universityId: approved.universityId } }));
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  const tokenRecord = await findValidRefreshToken(refreshToken);

  if (!tokenRecord?.user) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }

  await revokeRefreshToken(refreshToken);

  const newAccessToken = signToken({
    sub: tokenRecord.user.id,
    role: tokenRecord.user.role,
    universityId: tokenRecord.user.universityId,
  });
  const newRefreshToken = await issueRefreshToken(tokenRecord.user.id);

  return res.json(
    ok({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    }),
  );
};

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required' });
  }

  const userId = req.user?.sub;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const matches = await comparePassword(currentPassword, user.passwordHash);
  if (!matches) {
    return res.status(403).json({ message: 'Current password is incorrect' });
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return res.json(ok({ message: 'Password changed successfully' }));
};

export const verifyPassword = async (req: Request, res: Response) => {
  const { password, hash } = req.body as { password?: string; hash?: string };
  if (!password || !hash) {
    return res.status(400).json({ message: 'Password and hash are required' });
  }

  const matched = await comparePassword(password, hash);
  return res.json(ok({ matched }));
};
