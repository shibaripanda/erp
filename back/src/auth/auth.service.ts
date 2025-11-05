import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SigninDto } from './dto/Signin.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signin(data: SigninDto) {
    const user = await this.userService.getUserByUserId(data.user_id);
    if (!user) throw new ForbiddenException('Invalid user');

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) throw new UnauthorizedException('Invalid password');

    const tokens = await this.getTokens(user.id, user.user_id);
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async signup(data: SigninDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userService.create(data.user_id, hashedPassword);
    const tokens = await this.getTokens(user.id, user.user_id);
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refreshTokens(id: number, refreshToken: string) {
    const user = await this.userService.getUserById(id);
    if (!user || !user.refresh_token)
      throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(refreshToken, user.refresh_token);
    if (!rtMatches) throw new ForbiddenException('Invalid refresh token');

    const tokens = await this.getTokens(user.id, user.user_id);
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async getTokens(id: number, user_id: string) {
    const payload = { sub: id, user_id };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'superrefreshkey',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
