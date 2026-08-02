import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import {
  createDisciplinaryCase,
  getDisciplinaryCaseById,
  listDisciplinaryCases,
  updateDisciplinaryCase,
  createAppeal,
  getAppealById,
  listAppealsForCase,
  reviewAppeal,
} from '../controllers/disciplinary.controller.js';

export const disciplinaryRouter = Router();

disciplinaryRouter.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH'), createDisciplinaryCase);
disciplinaryRouter.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH', 'ATHLETE'), listDisciplinaryCases);
disciplinaryRouter.get('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH', 'ATHLETE'), getDisciplinaryCaseById);
disciplinaryRouter.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH'), updateDisciplinaryCase);

disciplinaryRouter.post('/:id/appeals', authenticate, authorizeRoles('ATHLETE'), createAppeal);
disciplinaryRouter.get('/:id/appeals', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH', 'ATHLETE'), listAppealsForCase);
disciplinaryRouter.get('/appeals/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH', 'ATHLETE'), getAppealById);
disciplinaryRouter.put('/appeals/:id/review', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'SPORTS_OFFICER', 'COACH'), reviewAppeal);
