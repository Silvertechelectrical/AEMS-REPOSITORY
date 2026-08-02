import { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { createQrToken, validateQrToken, listAttendanceByAthlete } from '../services/qr.service.js';
import { createAuditLog } from '../services/audit.service.js';

export const generateQrToken = async (req: Request, res: Response) => {
  const { athleteId } = req.body as { athleteId?: string };
  if (!athleteId) {
    return res.status(400).json({ message: 'athleteId is required' });
  }

  try {
    const qrToken = await createQrToken(athleteId);
    return res.status(201).json(ok(qrToken));
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Unable to generate QR token' });
  }
};

export const verifyQrToken = async (req: Request, res: Response) => {
  const { token } = req.body as { token?: string };
  if (!token) {
    return res.status(400).json({ message: 'token is required' });
  }

  const result = await validateQrToken(token);
  if (!result.valid) {
    return res.status(422).json(ok({ valid: false, reason: result.reason }));
  }

  try {
    await createAuditLog({
      userId: req.user?.sub ?? null,
      action: 'VERIFY_QR_TOKEN',
      resourceType: 'QrToken',
      resourceId: result.attendance?.id ?? null,
    });
  } catch (e) {
    console.warn('audit log failed', e);
  }

  return res.json(ok(result));
};

export const getAttendanceByAthlete = async (req: Request, res: Response) => {
  const { athleteId } = req.params as { athleteId?: string };

  if (!athleteId) {
    return res.status(400).json({ message: 'athleteId is required' });
  }

  const attendance = await listAttendanceByAthlete(athleteId);
  return res.json(ok({ athleteId, attendance }));
};
