import { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { prisma } from '../lib/prisma.js';
import { createAuditLog } from '../services/audit.service.js';

const isUniversityScopedUser = (role: string) =>
  ['UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH', 'TEAM_CAPTAIN'].includes(role);

export const listCompetitions = async (_req: Request, res: Response) => {
  const competitions = await prisma.competition.findMany({
    include: { teams: { include: { team: { include: { sport: true, university: true } } } } },
  });

  return res.json(ok(competitions));
};

export const getCompetitionById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const competition = await prisma.competition.findUnique({
    where: { id },
    include: { teams: { include: { team: { include: { sport: true, university: true } } } } },
  });

  if (!competition) {
    return res.status(404).json({ message: 'Competition not found' });
  }

  return res.json(ok(competition));
};

export const createCompetition = async (req: Request, res: Response) => {
  const authUser = req.user;
  const { name, date, location } = req.body as { name?: string; date?: string; location?: string };

  if (!authUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!name || !date || !location) {
    return res.status(400).json({ message: 'name, date, and location are required' });
  }

  const competition = await prisma.competition.create({
    data: {
      name,
      date: new Date(date),
      location,
    },
  });

  return res.status(201).json(ok(competition));
};

export const registerTeamForCompetition = async (req: Request, res: Response) => {
  const authUser = req.user;
  const { competitionId } = req.params;
  const { teamId } = req.body as { teamId?: string };

  if (!authUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!teamId) {
    return res.status(400).json({ message: 'teamId is required' });
  }

  const competition = await prisma.competition.findUnique({ where: { id: competitionId } });
  if (!competition) {
    return res.status(404).json({ message: 'Competition not found' });
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { athletes: { include: { athlete: true } }, university: true },
  });

  if (!team) {
    return res.status(404).json({ message: 'Team not found' });
  }

  if (isUniversityScopedUser(authUser.role) && team.universityId !== authUser.universityId) {
    return res.status(403).json({ message: 'Cannot register a team outside your university' });
  }

  const existingRegistration = await prisma.competitionTeam.findFirst({
    where: { competitionId, teamId },
  });

  if (existingRegistration) {
    return res.status(409).json({ message: 'Team is already registered for this competition' });
  }

  const athleteRecords = team.athletes.map((link) => link.athlete);
  const invalidAthletes = athleteRecords.filter(
    (athlete) => athlete.verificationStatus !== 'VERIFIED' || athlete.eligibilityStatus !== 'APPROVED',
  );

  if (invalidAthletes.length > 0) {
    return res.status(422).json(
      ok({
        registered: false,
        reason: 'Team contains athletes who are not eligible for competition',
        invalidAthletes: invalidAthletes.map((athlete) => ({
          id: athlete.id,
          fullName: athlete.fullName,
          verificationStatus: athlete.verificationStatus,
          eligibilityStatus: athlete.eligibilityStatus,
        })),
      }),
    );
  }

  const registration = await prisma.competitionTeam.create({
    data: {
      competitionId,
      teamId,
    },
  });

  await createAuditLog({
    userId: authUser.sub,
    action: 'REGISTER_TEAM_FOR_COMPETITION',
    resourceType: 'CompetitionTeam',
    resourceId: registration.id,
  });

  return res.status(201).json(ok({ registered: true, registration }));
};

export const submitCompetitionResult = async (req: Request, res: Response) => {
  const authUser = req.user;
  const { competitionId } = req.params;
  const { teamId, result, position, score, notes } = req.body as {
    teamId?: string;
    result?: string;
    position?: number;
    score?: number;
    notes?: string;
  };

  if (!authUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!teamId || !result) {
    return res.status(400).json({ message: 'teamId and result are required' });
  }

  const competition = await prisma.competition.findUnique({ where: { id: competitionId } });
  if (!competition) {
    return res.status(404).json({ message: 'Competition not found' });
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    return res.status(404).json({ message: 'Team not found' });
  }

  if (isUniversityScopedUser(authUser.role) && team.universityId !== authUser.universityId) {
    return res.status(403).json({ message: 'Cannot submit results for a team outside your university' });
  }

  const competitionResult = await prisma.competitionResult.upsert({
    where: {
      competitionId_teamId: {
        competitionId,
        teamId,
      },
    },
    update: {
      result,
      position,
      score,
      notes,
    },
    create: {
      competitionId,
      teamId,
      result,
      position,
      score,
      notes,
    },
  });

  await createAuditLog({
    userId: authUser.sub,
    action: 'SUBMIT_COMPETITION_RESULT',
    resourceType: 'CompetitionResult',
    resourceId: competitionResult.id,
  });

  return res.status(201).json(ok(competitionResult));
};

export const getCompetitionLeaderboard = async (req: Request, res: Response) => {
  const { competitionId } = req.params;

  const competition = await prisma.competition.findUnique({ where: { id: competitionId } });
  if (!competition) {
    return res.status(404).json({ message: 'Competition not found' });
  }

  const leaderboard = await prisma.competitionResult.findMany({
    where: { competitionId },
    include: { team: true },
    orderBy: [{ position: 'asc' }, { score: 'desc' }],
  });

  return res.json(ok(leaderboard));
};
