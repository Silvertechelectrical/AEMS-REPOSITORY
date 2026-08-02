import { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { prisma } from '../lib/prisma.js';

export const listUniversities = async (_req: Request, res: Response) => {
  const universities = await prisma.university.findMany();
  return res.json(ok(universities));
};

export const getUniversityById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const university = await prisma.university.findUnique({ where: { id } });

  if (!university) {
    return res.status(404).json({ message: 'University not found' });
  }

  return res.json(ok(university));
};

export const registerUniversity = async (req: Request, res: Response) => {
  const payload = req.body as { name?: string; code?: string; location?: string };

  if (!payload.name || !payload.code || !payload.location) {
    return res.status(400).json({ message: 'Name, code, and location are required' });
  }

  const created = await prisma.university.create({
    data: {
      name: payload.name,
      code: payload.code,
      location: payload.location,
    },
  });

  return res.status(201).json(ok(created));
};

export const updateUniversity = async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body as { name?: string; code?: string; location?: string };
  const university = await prisma.university.findUnique({ where: { id } });

  if (!university) {
    return res.status(404).json({ message: 'University not found' });
  }

  const updated = await prisma.university.update({
    where: { id },
    data: payload,
  });

  return res.json(ok(updated));
};

export const deleteUniversity = async (req: Request, res: Response) => {
  const { id } = req.params;
  const university = await prisma.university.findUnique({ where: { id } });

  if (!university) {
    return res.status(404).json({ message: 'University not found' });
  }

  await prisma.university.delete({ where: { id } });
  return res.json(ok({ deletedUniversityId: id }));
};
