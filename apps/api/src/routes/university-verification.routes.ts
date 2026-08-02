import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { verifyStudentRegistration, reverifyStudent } from '../controllers/university-verification.controller.js';

export const universityVerificationRouter = Router();

universityVerificationRouter.post(
  '/verify',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH', 'TEAM_CAPTAIN'),
  verifyStudentRegistration,
);

universityVerificationRouter.post(
  '/:universityStudentId/reverify',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH'),
  reverifyStudent,
);
