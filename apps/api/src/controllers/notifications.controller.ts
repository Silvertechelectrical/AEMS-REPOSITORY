import { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { listNotificationsForUser, markNotificationRead } from '../services/notification.service.js';

export const listNotifications = async (req: Request, res: Response) => {
  const authUser = req.user;
  if (!authUser) return res.status(401).json({ message: 'Authentication required' });

  const notifications = await listNotificationsForUser(authUser.sub);
  return res.json(ok(notifications));
};

export const readNotification = async (req: Request, res: Response) => {
  const authUser = req.user;
  const { id } = req.params;
  if (!authUser) return res.status(401).json({ message: 'Authentication required' });

  const updated = await markNotificationRead(id);
  return res.json(ok(updated));
};

export default listNotifications;
