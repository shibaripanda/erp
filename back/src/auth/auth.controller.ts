import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/Signin.dto';
import { RefreshTokenDto } from './dto/RefreshToken.dto';
import { Request, Response } from 'express';
import { SessionService } from 'src/session/session.service';
import * as bcrypt from 'bcrypt';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('/signin')
  async signin(
    @Body() data: SigninDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log(data);
    const { accessToken, refreshToken } = await this.authService.signin(data);
    this.authService.sendRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('/signin/new_token')
  async getToken(
    @Body() data: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    console.log(data);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const current_refreshToken = req.cookies['refresh_token'] as string;
    if (!current_refreshToken) throw new UnauthorizedException();

    const session =
      await this.sessionService.findByRefreshToken(current_refreshToken);
    if (!session) throw new UnauthorizedException();

    const valid = await bcrypt.compare(
      current_refreshToken,
      session.refreshTokenHash,
    );
    if (!valid) {
      await this.sessionService.delete(session.id);
      throw new UnauthorizedException();
    }

    const { accessToken, refreshToken } =
      await this.authService.refreshTokens(session);
    this.authService.sendRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('/signup')
  async signup(
    @Body() data: SigninDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log(data);
    const { accessToken, refreshToken } = await this.authService.signup(data);
    this.authService.sendRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  @Get('/logout/:deviceid')
  async logout(@Param('deviceid') deviceid: string, @Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const current_refreshToken = req.cookies['refresh_token'] as string;
    console.log(current_refreshToken, deviceid);
    const session =
      await this.sessionService.findByRefreshToken(current_refreshToken);
    if (!session) throw new UnauthorizedException();
    await this.sessionService.delete(session.id);
    return { message: 'ok' };
  }
}
