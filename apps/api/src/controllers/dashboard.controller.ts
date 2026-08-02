import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getDashboardSummary = async (_req: Request, res: Response) => {
  const [universities, athletes, pendingVerification, sports] = await Promise.all([
    prisma.university.count(),
    prisma.athlete.count(),
    prisma.athlete.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.sport.findMany({ orderBy: { name: 'asc' } }),
  ]);

  res.json({
    message: 'KUSF AEMS dashboard summary',
    stats: {
      universities,
      registeredAthletes: athletes,
      pendingVerification,
      suspendedPlayers: 0,
      compliance: 100,
    },
    charts: {
      sportsDistribution: sports.map((sport) => ({ name: sport.name, value: 1 })),
    },
  });
};
