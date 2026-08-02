import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import {
  login,
  refresh,
  register,
  listPendingApprovals,
  registerCaptain,
  inviteOfficer,
  approveUser,
  verifyPassword,
  changePassword,
} from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.get('/pending-approvals', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN'), listPendingApprovals);
authRouter.post('/register-captain', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'SPORTS_OFFICER', 'UNIVERSITY_ADMIN'), registerCaptain);
authRouter.post('/invite-officer', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN'), inviteOfficer);
authRouter.post('/users/:id/approve', authenticate, authorizeRoles('SUPER_ADMIN', 'KUSF_ADMIN', 'UNIVERSITY_ADMIN'), approveUser);
authRouter.post('/refresh', refresh);
authRouter.post('/verify-password', verifyPassword);
authRouter.post('/change-password', authenticate, changePassword);
authRouter.get('/me', authenticate, (req, res) => res.json({ success: true, data: { user: req.user } }));
