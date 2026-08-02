import { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { prisma } from '../lib/prisma.js';
import { createAuditLog } from '../services/audit.service.js';
import { createNotification } from '../services/notification.service.js';

const isUniversityScopedUser = (role: string) =>
  ['UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH', 'TEAM_CAPTAIN'].includes(role);

const canAccessCase = (user: any, disciplinaryCase: any) => {
  if (!disciplinaryCase) {
    return false;
  }

  if (user.role === 'SUPER_ADMIN' || user.role === 'KUSF_ADMIN') {
    return true;
  }

  if (disciplinaryCase.universityId === user.universityId) {
    if (user.role === 'UNIVERSITY_ADMIN' || user.role === 'SPORTS_OFFICER' || user.role === 'COACH') {
      return true;
    }

    if (user.role === 'ATHLETE' && disciplinaryCase.athlete.userId === user.sub) {
      return true;
    }
  }

  return false;
};

export const createDisciplinaryCase = async (req: Request, res: Response) => {
  const authUser = req.user;
  const { athleteId, offense, description, incidentDate, banPeriodDays, banStartDate, banEndDate } = req.body as {
    athleteId?: string;
    offense?: string;
    description?: string;
    incidentDate?: string;
    banPeriodDays?: number;
    banStartDate?: string;
    banEndDate?: string;
  };

  if (!authUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!athleteId || !offense || !description || !incidentDate) {
    return res.status(400).json({ message: 'athleteId, offense, description, and incidentDate are required' });
  }

  const athlete = await prisma.athlete.findUnique({ where: { id: athleteId }, include: { user: true } });
  if (!athlete) {
    return res.status(404).json({ message: 'Athlete not found' });
  }

  if (isUniversityScopedUser(authUser.role) && athlete.universityId !== authUser.universityId) {
    return res.status(403).json({ message: 'Cannot create a disciplinary case for an athlete outside your university' });
  }

  const disciplinaryCase = await prisma.disciplinaryCase.create({
    data: {
      athleteId,
      universityId: athlete.universityId,
      offense,
      description,
      incidentDate: new Date(incidentDate),
      banPeriodDays,
      banStartDate: banStartDate ? new Date(banStartDate) : undefined,
      banEndDate: banEndDate ? new Date(banEndDate) : undefined,
    },
  });

  await createAuditLog({
    userId: authUser.sub,
    action: 'CREATE_DISCIPLINARY_CASE',
    resourceType: 'DisciplinaryCase',
    resourceId: disciplinaryCase.id,
  });

  return res.status(201).json(ok(disciplinaryCase));
};

export const listDisciplinaryCases = async (req: Request, res: Response) => {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (authUser.role === 'SUPER_ADMIN' || authUser.role === 'KUSF_ADMIN') {
    const allCases = await prisma.disciplinaryCase.findMany({ include: { athlete: true, university: true, appeals: true } });
    return res.json(ok(allCases));
  }

  if (authUser.role === 'ATHLETE') {
    const athlete = await prisma.athlete.findUnique({ where: { userId: authUser.sub } });
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete profile not found' });
    }

    const athleteCases = await prisma.disciplinaryCase.findMany({
      where: { athleteId: athlete.id },
      include: { athlete: true, university: true, appeals: true },
    });
    return res.json(ok(athleteCases));
  }

  if (isUniversityScopedUser(authUser.role)) {
    const universityCases = await prisma.disciplinaryCase.findMany({
      where: { universityId: authUser.universityId ?? undefined },
      include: { athlete: true, university: true, appeals: true },
    });
    return res.json(ok(universityCases));
  }

  return res.status(403).json({ message: 'Forbidden' });
};

export const getDisciplinaryCaseById = async (req: Request, res: Response) => {
  const authUser = req.user;
  const { id } = req.params;

  if (!authUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const disciplinaryCase = await prisma.disciplinaryCase.findUnique({
    where: { id },
    include: { athlete: { include: { user: true } }, university: true, appeals: true },
  });

  if (!disciplinaryCase) {
    return res.status(404).json({ message: 'Disciplinary case not found' });
  }

  if (!canAccessCase(authUser, disciplinaryCase)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return res.json(ok(disciplinaryCase));
};

export const updateDisciplinaryCase = async (req: Request, res: Response) => {
  const authUser = req.user;
  const { id } = req.params;
  const payload = req.body as {
    status?: 'OPEN' | 'UNDER_REVIEW' | 'CLOSED';
    decision?: string;
    banPeriodDays?: number;
    banStartDate?: string;
    banEndDate?: string;
  };

  if (!authUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const disciplinaryCase = await prisma.disciplinaryCase.findUnique({ where: { id } });
  if (!disciplinaryCase) {
    return res.status(404).json({ message: 'Disciplinary case not found' });
  }

  if (isUniversityScopedUser(authUser.role) && disciplinaryCase.universityId !== authUser.universityId) {
    return res.status(403).json({ message: 'Cannot update a disciplinary case outside your university' });
  }

  const data: any = {};
  if (payload.status) data.status = payload.status;
  if (payload.decision !== undefined) data.decision = payload.decision;
  if (payload.banPeriodDays !== undefined) data.banPeriodDays = payload.banPeriodDays;
  if (payload.banStartDate) data.banStartDate = new Date(payload.banStartDate);
  if (payload.banEndDate) data.banEndDate = new Date(payload.banEndDate);

  if (payload.status === 'CLOSED' && payload.banPeriodDays && !payload.banEndDate) {
    data.banEndDate = new Date(Date.now() + payload.banPeriodDays * 24 * 60 * 60 * 1000);
  }

  const updatedCase = await prisma.disciplinaryCase.update({ where: { id }, data });
  return res.json(ok(updatedCase));
};

export const createAppeal = async (req: Request, res: Response) => {
  const authUser = req.user;
  const { id } = req.params;
  const { requestDetails } = req.body as { requestDetails?: string };

  if (!authUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!requestDetails) {
    return res.status(400).json({ message: 'requestDetails is required' });
  }

  const disciplinaryCase = await prisma.disciplinaryCase.findUnique({
    where: { id },
    include: { athlete: true },
  });
  if (!disciplinaryCase) {
    return res.status(404).json({ message: 'Disciplinary case not found' });
  }

  if (authUser.role !== 'ATHLETE' || disciplinaryCase.athlete.userId !== authUser.sub) {
    return res.status(403).json({ message: 'Only the athlete assigned to the disciplinary case may submit an appeal' });
  }

  const appeal = await prisma.appeal.create({
    data: {
      disciplinaryCaseId: disciplinaryCase.id,
      athleteId: disciplinaryCase.athleteId,
      requestDetails,
    },
  });

  await createAuditLog({
    userId: authUser.sub,
    action: 'CREATE_APPEAL',
    resourceType: 'Appeal',
    resourceId: appeal.id,
  });

  await createNotification(authUser.sub, 'Appeal submitted', `Your appeal (${appeal.id}) has been submitted and is pending review.`, 'INFO');

  return res.status(201).json(ok(appeal));
};

export const listAppealsForCase = async (req: Request, res: Response) => {
  const authUser = req.user;
  const { id } = req.params;

  if (!authUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const disciplinaryCase = await prisma.disciplinaryCase.findUnique({
    where: { id },
    include: { athlete: { include: { user: true } } },
  });

  if (!disciplinaryCase) {
    return res.status(404).json({ message: 'Disciplinary case not found' });
  }

  if (!canAccessCase(authUser, disciplinaryCase)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const appeals = await prisma.appeal.findMany({
    where: { disciplinaryCaseId: disciplinaryCase.id },
    include: { athlete: true, disciplinaryCase: true },
  });

  return res.json(ok(appeals));
};

export const getAppealById = async (req: Request, res: Response) => {
  const authUser = req.user;
  const { id } = req.params;

  if (!authUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const appeal = await prisma.appeal.findUnique({
    where: { id },
    include: {
      athlete: true,
      disciplinaryCase: { include: { athlete: { include: { user: true } }, university: true } },
    },
  });

  if (!appeal) {
    return res.status(404).json({ message: 'Appeal not found' });
  }

  if (!canAccessCase(authUser, appeal.disciplinaryCase)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return res.json(ok(appeal));
};

export const reviewAppeal = async (req: Request, res: Response) => {
  const authUser = req.user;
  const { id } = req.params;
  const { status } = req.body as { status?: 'APPROVED' | 'REJECTED' };

  if (!authUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!status) {
    return res.status(400).json({ message: 'status is required' });
  }

  const appeal = await prisma.appeal.findUnique({
    where: { id },
    include: { disciplinaryCase: true },
  });

  if (!appeal) {
    return res.status(404).json({ message: 'Appeal not found' });
  }

  if (isUniversityScopedUser(authUser.role) && appeal.disciplinaryCase.universityId !== authUser.universityId) {
    return res.status(403).json({ message: 'Cannot review an appeal outside your university' });
  }

  const updatedAppeal = await prisma.appeal.update({
    where: { id },
    data: {
      status,
      reviewedBy: authUser.sub,
      reviewedAt: new Date(),
    },
  });

  await createAuditLog({
    userId: authUser.sub,
    action: 'REVIEW_APPEAL',
    resourceType: 'Appeal',
    resourceId: updatedAppeal.id,
  });

  // notify athlete about review result
  try {
    const athleteRecord = await prisma.athlete.findUnique({ where: { id: updatedAppeal.athleteId } });
    if (athleteRecord?.userId) {
      await createNotification(athleteRecord.userId, 'Appeal reviewed', `Your appeal (${updatedAppeal.id}) has been ${updatedAppeal.status}.`, 'ACTION_REQUIRED');
    }
  } catch (e) {
    // swallow notification errors
    console.warn('Notification failed', e);
  }

  return res.json(ok(updatedAppeal));
};
