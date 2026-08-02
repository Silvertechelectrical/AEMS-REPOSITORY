import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { listDocuments, uploadDocumentMetadata, verifyDocument } from '../controllers/documents.controller.js';

export const documentsRouter = Router();

documentsRouter.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'COACH', 'ATHLETE'), listDocuments);
documentsRouter.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN', 'COACH', 'ATHLETE'), uploadDocumentMetadata);
documentsRouter.patch('/:id/verify', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN'), verifyDocument);
