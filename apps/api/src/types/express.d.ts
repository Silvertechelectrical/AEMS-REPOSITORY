import type { Role } from '../constants/roles.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        role: Role;
        universityId?: string | null;
      };
    }
  }
}

export {};
