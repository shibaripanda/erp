import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: User;
}

@Injectable()
export class UniversalJwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const type = context.getType<'http'>();

    if (type === 'http') {
      const request: RequestWithUser = context.switchToHttp().getRequest();

      const authHeader = request.headers['authorization'];
      const token = authHeader?.split(' ')[1];
      if (!token) throw new UnauthorizedException('Token not provided');

      try {
        const payload = this.jwt.verify<User>(token);
        request.user = payload;
        return true;
      } catch {
        throw new UnauthorizedException('Invalid token');
      }
    }

    throw new UnauthorizedException('Unsupported request type');
  }
}
