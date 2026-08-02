import { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { prisma } from '../lib/prisma.js';

export const generateSimpleReport = async (req: Request, res: Response) => {
  const authUser = req.user;
  if (!authUser) return res.status(401).json({ message: 'Authentication required' });

  // Simple synchronous report: counts for core entities
  const [competitions, athletes, teams, attendance] = await Promise.all([
    prisma.competition.count(),
    prisma.athlete.count(),
    prisma.team.count(),
    prisma.attendanceRecord.count(),
  ]);

  const result = { competitions, athletes, teams, attendance };

  const report = await prisma.report.create({
    data: {
      name: 'simple-summary',
      type: 'summary',
      generatedBy: authUser.sub,
      filters: req.body.filters ?? null,
      result,
      status: 'COMPLETED',
    },
  });

  return res.json(ok(report));
};

export const getReport = async (req: Request, res: Response) => {
  const { id } = req.params;
  const authUser = req.user;
  if (!authUser) return res.status(401).json({ message: 'Authentication required' });

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return res.status(404).json({ message: 'Report not found' });

  return res.json(ok(report));
};

export default generateSimpleReport;
