import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { generateQrToken, verifyQrToken, getAttendanceByAthlete } from '../controllers/qr.controller.js';

export const qrRouter = Router();

qrRouter.post('/generate', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'COACH', 'TEAM_CAPTAIN', 'ATHLETE'), generateQrToken);
qrRouter.post('/verify', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'COACH', 'MATCH_OFFICIAL'), verifyQrToken);
qrRouter.get('/attendance/:athleteId', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH', 'TEAM_CAPTAIN', 'ATHLETE'), getAttendanceByAthlete);
