import { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { prisma } from '../lib/prisma.js';

export const listDocuments = async (_req: Request, res: Response) => {
  const documents = await prisma.document.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json(ok(documents));
};

export const uploadDocumentMetadata = async (req: Request, res: Response) => {
  const payload = req.body as { athleteId?: string; documentType?: string; fileUrl?: string };
  if (!payload.athleteId || !payload.documentType || !payload.fileUrl) {
    return res.status(400).json({ message: 'Athlete, document type, and file URL are required' });
  }

  const document = await prisma.document.create({
    data: {
      athleteId: payload.athleteId,
      documentType: payload.documentType,
      fileUrl: payload.fileUrl,
      verificationStatus: 'PENDING',
    },
  });

  return res.status(201).json(ok(document));
};

export const verifyDocument = async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body as { verificationStatus?: 'VERIFIED' | 'REJECTED' };
  const document = await prisma.document.update({
    where: { id },
    data: { verificationStatus: payload.verificationStatus ?? 'VERIFIED' },
  });
  return res.json(ok(document));
};
