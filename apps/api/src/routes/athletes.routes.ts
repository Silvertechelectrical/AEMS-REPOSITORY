import { Router } from 'express';
import {
  createAthlete,
  deleteAthlete,
  getAthleteById,
  listAthletes,
  nominateAthlete,
  updateAthlete,
  verifyAthlete,
} from '../controllers/athletes.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

export const athletesRouter = Router();

athletesRouter.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'COACH', 'ATHLETE'), listAthletes);
athletesRouter.get('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'COACH', 'ATHLETE'), getAthleteById);
athletesRouter.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'COACH'), createAthlete);
athletesRouter.post('/nominate', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH', 'TEAM_CAPTAIN'), nominateAthlete);
athletesRouter.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'COACH'), updateAthlete);
athletesRouter.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN'), deleteAthlete);
athletesRouter.post('/verify', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN'), verifyAthlete);
