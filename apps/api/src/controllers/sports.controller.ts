import { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { prisma } from '../lib/prisma.js';

export const listSports = async (_req: Request, res: Response) => {
  const sports = await prisma.sport.findMany({ orderBy: { name: 'asc' } });
  return res.json(ok(sports));
};

export const createSport = async (req: Request, res: Response) => {
  const payload = req.body as { name?: string; category?: string };
  if (!payload.name || !payload.category) {
    return res.status(400).json({ message: 'Name and category are required' });
  }

  const sport = await prisma.sport.create({ data: { name: payload.name, category: payload.category } });
  return res.status(201).json(ok(sport));
};

export const updateSport = async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body as { name?: string; category?: string };
  const sport = await prisma.sport.findUnique({ where: { id } });

  if (!sport) {
    return res.status(404).json({ message: 'Sport not found' });
  }

  const updated = await prisma.sport.update({ where: { id }, data: payload });
  return res.json(ok(updated));
};

export const deleteSport = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.sport.delete({ where: { id } }).catch(() => undefined);
  return res.json(ok({ deletedSportId: id }));
};
