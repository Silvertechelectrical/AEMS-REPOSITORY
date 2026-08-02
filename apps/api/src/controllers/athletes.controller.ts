import { Request, Response } from 'express';
import { evaluateEligibility } from '../services/eligibility.service.js';
import { verifyUniversityStudent } from '../services/university-verification.service.js';
import { ok } from '../utils/response.js';
import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../services/auth.service.js';

export const listAthletes = async (_req: Request, res: Response) => {
  const athletes = await prisma.athlete.findMany({ include: { university: true, sport: true, user: true } });
  return res.json(ok(athletes));
};

export const getAthleteById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const athlete = await prisma.athlete.findUnique({ where: { id }, include: { university: true, sport: true, user: true } });

  if (!athlete) {
    return res.status(404).json({ message: 'Athlete not found' });
  }

  return res.json(ok(athlete));
};

export const createAthlete = async (req: Request, res: Response) => {
  const payload = req.body as {
    fullName?: string;
    userId?: string;
    universityId?: string;
    sportId?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    phone?: string;
  };

  if (!payload.fullName || !payload.userId || !payload.universityId || !payload.sportId) {
    return res.status(400).json({ message: 'Full name, user, university, and sport are required' });
  }

  const created = await prisma.athlete.create({
    data: {
      userId: payload.userId,
      fullName: payload.fullName,
      dateOfBirth: new Date(payload.dateOfBirth ?? '2005-01-01'),
      gender: payload.gender ?? 'Unknown',
      nationality: payload.nationality ?? 'Kenyan',
      phone: payload.phone,
      universityId: payload.universityId,
      sportId: payload.sportId,
    },
  });

  return res.status(201).json(ok(created));
};

export const updateAthlete = async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const athlete = await prisma.athlete.findUnique({ where: { id } });

  if (!athlete) {
    return res.status(404).json({ message: 'Athlete not found' });
  }

  const updated = await prisma.athlete.update({ where: { id }, data: payload });
  return res.json(ok(updated));
};

export const deleteAthlete = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.athlete.delete({ where: { id } }).catch(() => undefined);
  return res.json(ok({ deletedAthleteId: id }));
};

export const nominateAthlete = async (req: Request, res: Response) => {
  const { studentNumber, sportId, teamId } = req.body as {
    studentNumber?: string;
    sportId?: string;
    teamId?: string;
  };

  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!studentNumber || !sportId || !teamId) {
    return res.status(400).json({ message: 'studentNumber, sportId, and teamId are required' });
  }

  const user = await prisma.user.findUnique({ where: { id: authUser.sub } });
  if (!user || !user.universityId) {
    return res.status(403).json({ message: 'Your account does not have an assigned university scope' });
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    return res.status(404).json({ message: 'Team not found' });
  }

  if (team.universityId !== user.universityId) {
    return res.status(403).json({ message: 'Cannot nominate athletes for a team outside your university' });
  }

  if (team.sportId !== sportId) {
    return res.status(400).json({ message: 'Selected sport does not match the target team sport' });
  }

  if (authUser.role === 'COACH' && team.coachId !== user.id) {
    return res.status(403).json({ message: 'Coaches may nominate athletes only for their assigned team' });
  }

  const university = await prisma.university.findUnique({ where: { id: user.universityId } });
  if (!university) {
    return res.status(404).json({ message: 'University not found' });
  }

  const verification = await verifyUniversityStudent(studentNumber, university.code);
  if (!verification.verified) {
    return res.status(422).json(ok({ nominated: false, reason: verification.eligibility.reasons, verified: false }));
  }

  const candidate = await prisma.universityStudent.findFirst({
    where: { universityStudentId: studentNumber, universityId: user.universityId },
  });

  if (!candidate) {
    return res.status(404).json({ message: 'University student record not found' });
  }

  const existingAthlete = await prisma.athlete.findFirst({ where: { universityStudentId: candidate.id } });
  if (existingAthlete) {
    return res.status(409).json({ message: 'This student is already registered as an AEMS athlete' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: `${studentNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@aems.local` } });
  if (existingUser) {
    return res.status(409).json({ message: 'AEMS account already exists for this student number' });
  }

  const passwordHash = await hashPassword(Math.random().toString(36).slice(2, 12));
  const athleteUser = await prisma.user.create({
    data: {
      name: verification.student?.name ?? `Athlete ${studentNumber}`,
      email: `${studentNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@aems.local`,
      passwordHash,
      role: 'ATHLETE',
      universityId: user.universityId,
      approved: true,
    },
  });

  const createdAthlete = await prisma.athlete.create({
    data: {
      userId: athleteUser.id,
      fullName: verification.student?.name ?? `Athlete ${studentNumber}`,
      dateOfBirth: new Date(verification.student?.dateOfBirth ?? new Date().toISOString()),
      gender: verification.student?.gender ?? 'Unknown',
      nationality: 'Kenyan',
      universityId: user.universityId,
      sportId,
      universityStudentId: candidate.id,
      verificationStatus: 'VERIFIED',
      eligibilityStatus: verification.eligibility.status === 'ELIGIBLE' ? 'APPROVED' : 'REJECTED',
    },
  });

  await prisma.teamAthlete.create({
    data: {
      teamId,
      athleteId: createdAthlete.id,
    },
  }).catch(() => undefined);

  return res.status(201).json(ok({ nominated: true, athlete: createdAthlete, verification }));
};

export const verifyAthlete = (req: Request, res: Response) => {
  const payload = req.body as {
    age: number;
    enrolled: boolean;
    activeAcademicStatus: boolean;
    hasDisciplinarySuspension: boolean;
    hasMultipleUniversities: boolean;
    competitionLimitReached: boolean;
  };

  const ruleResults = evaluateEligibility(payload);
  const passed = ruleResults.every((result) => result.passed);

  return res.json(
    ok({
      eligible: passed,
      summary: `Eligibility ${passed ? 'approved' : 'rejected'}`,
      rules: ruleResults,
    }),
  );
};
