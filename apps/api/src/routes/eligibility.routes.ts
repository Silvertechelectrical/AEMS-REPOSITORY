import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { getEligibilityStatus } from '../controllers/eligibility.controller.js';

export const eligibilityRouter = Router();

eligibilityRouter.get('/:athleteId', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'COACH', 'ATHLETE'), getEligibilityStatus);
