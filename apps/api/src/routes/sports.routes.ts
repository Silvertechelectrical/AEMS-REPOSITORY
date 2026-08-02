import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { listSports, createSport, updateSport, deleteSport } from '../controllers/sports.controller.js';

export const sportsRouter = Router();

sportsRouter.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN'), listSports);
sportsRouter.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN'), createSport);
sportsRouter.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN'), updateSport);
sportsRouter.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN'), deleteSport);
