import { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { prisma } from '../lib/prisma.js';
import { verifyUniversityStudent } from '../services/university-verification.service.js';

export const getEligibilityStatus = async (req: Request, res: Response) => {
  const { athleteId } = req.params;
  const athlete = await prisma.athlete.findUnique({ where: { id: athleteId }, include: { university: true, universityStudent: true } });

  if (!athlete) {
    return res.status(404).json({ message: 'Athlete not found' });
  }

  if (!athlete.universityStudentId || !athlete.universityStudent) {
    return res.status(422).json({ message: 'Athlete has not been linked to an authoritative university student record yet.' });
  }

  const universityCode = athlete.university.code;
  const verification = await verifyUniversityStudent(athlete.universityStudent.universityStudentId, universityCode);

  return res.json(
    ok({
      eligible: verification.eligibility.status === 'ELIGIBLE',
      status: verification.eligibility.status,
      student: verification.student,
      reasons: verification.eligibility.reasons,
      verified: verification.verified,
    }),
  );
};
