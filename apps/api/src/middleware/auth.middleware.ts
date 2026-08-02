import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '../constants/roles.js';
import { isValidRole } from '../constants/roles.js';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing bearer token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'development-secret');
    const p = payload as { sub: string; role: string; universityId?: string | null };
    // coerce role to typed Role when valid
    req.user = {
      sub: p.sub,
      role: isValidRole(p.role) ? (p.role as Role) : ('ATHLETE' as Role),
      universityId: p.universityId ?? null,
    };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (...roles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
  }

  return next();
};
