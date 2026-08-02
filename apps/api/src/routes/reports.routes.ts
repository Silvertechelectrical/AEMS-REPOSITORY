import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { generateSimpleReport, getReport } from '../controllers/reports.controller.js';

export const reportsRouter = Router();

reportsRouter.post('/generate', authenticate, generateSimpleReport);
reportsRouter.get('/:id', authenticate, getReport);
