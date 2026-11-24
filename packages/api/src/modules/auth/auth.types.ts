import type { UserRole } from '@marketplace/shared';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: UserRole[];
}
