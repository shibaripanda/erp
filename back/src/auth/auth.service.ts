import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SigninDto } from './dto/Signin.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from 'src/session/session.service';
import { Response } from 'express';
import { Session } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private readonly sessionService: SessionService,
  ) {}

  async signin(data: SigninDto) {
    const user = await this.userService.getUserByUserId(data.user_id);
    if (!user) throw new ForbiddenException('Invalid user');

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) throw new UnauthorizedException('Invalid password');

    const tokens = await this.getTokens(user.id, user.user_id);

    await this.createSession(tokens.refreshToken, user.id, data.deviceId);

    return tokens;
  }

  async signup(data: SigninDto) {
    const existUser = await this.userService.getUserByUserId(data.user_id);
    if (existUser) throw new ForbiddenException('User exist');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userService.create(data.user_id, hashedPassword);

    const tokens = await this.getTokens(user.id, user.user_id);

    await this.createSession(tokens.refreshToken, user.id, data.deviceId);

    return tokens;
  }

  async refreshTokens(session: Session) {
    const user = await this.userService.getUserById(session.userId);
    if (!user) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.user_id);
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.sessionService.update(session.id, refreshTokenHash, expiresAt);

    return tokens;
  }

  private async createSession(token: string, userId: number, deviceId: string) {
    const refreshTokenHash = await bcrypt.hash(token, 10);

    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    await this.sessionService.create(
      userId,
      refreshTokenHash,
      deviceId,
      expiresAt,
    );
  }

  private async getTokens(id: number, user_id: string) {
    const payload = { sub: id, user_id };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'superrefreshkey',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  sendRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/signin/new_token',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
  }
}
