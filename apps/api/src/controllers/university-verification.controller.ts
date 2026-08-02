import { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { verifyUniversityStudent, verifyUniversityStudentRecord } from '../services/university-verification.service.js';

export const verifyStudentRegistration = async (req: Request, res: Response) => {
  const { studentNumber, universityCode } = req.body as {
    studentNumber?: string;
    universityCode?: string;
  };

  if (!studentNumber || !universityCode) {
    return res.status(400).json({ message: 'studentNumber and universityCode are required' });
  }

  const result = await verifyUniversityStudent(studentNumber, universityCode);
  return res.json(ok(result));
};

export const reverifyStudent = async (req: Request, res: Response) => {
  const { universityStudentId } = req.params as { universityStudentId?: string };

  if (!universityStudentId) {
    return res.status(400).json({ message: 'universityStudentId is required' });
  }

  const result = await verifyUniversityStudentRecord(universityStudentId);
  return res.json(ok(result));
};
