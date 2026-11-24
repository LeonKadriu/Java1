import type { Request } from 'express';
import type { UserRole } from '@marketplace/shared';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      roles: UserRole[];
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: Express.User;
}
