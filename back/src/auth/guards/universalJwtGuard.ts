import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
// import { WsException } from '@nestjs/websockets';
import { Request } from 'express';
// import { Socket } from 'socket.io';
// import { User } from '../interfaces/user';

interface RequestWithUser extends Request {
  user?: User;
}

// interface SocketWithUser extends Socket {
//   data: {
//     user?: User;
//     [key: string]: unknown;
//   };
// }

@Injectable()
export class UniversalJwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const type = context.getType<'http' | 'ws'>();
    let token: string | undefined;

    // if (type === 'ws') {
    //   const client: SocketWithUser = context.switchToWs().getClient();

    //   token = (client.handshake.auth as { token?: string })?.token;
    //   if (!token) throw new WsException('Token not provided');

    //   try {
    //     const payload = this.jwt.verify<User>(token);
    //     client.data.user = payload; // ✅ правильно сохраняем в client.data
    //     return true;
    //   } catch {
    //     throw new WsException('Invalid token');
    //   }
    // }

    if (type === 'http') {
      const request: RequestWithUser = context.switchToHttp().getRequest();

      const authHeader = request.headers['authorization'];
      token = authHeader?.split(' ')[1];
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
