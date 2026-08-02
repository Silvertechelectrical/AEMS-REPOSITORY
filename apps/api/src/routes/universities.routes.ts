import { Router } from 'express';
import { deleteUniversity, getUniversityById, listUniversities, registerUniversity, updateUniversity } from '../controllers/universities.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

export const universitiesRouter = Router();

universitiesRouter.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN'), listUniversities);
universitiesRouter.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN'), registerUniversity);
universitiesRouter.get('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN'), getUniversityById);
universitiesRouter.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN'), updateUniversity);
universitiesRouter.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN'), deleteUniversity);
