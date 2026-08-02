import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { listNotifications, readNotification } from '../controllers/notifications.controller.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', authenticate, listNotifications);
notificationsRouter.put('/:id/read', authenticate, readNotification);
