import { Router } from 'express';
import { protectedTest } from '../controllers/test.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const testRouter = Router();

testRouter.get('/protected', authenticate, protectedTest);
