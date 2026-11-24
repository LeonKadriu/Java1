import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '../../modules/auth/auth.types';
import type { AuthenticatedRequest } from '../../types/express';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
