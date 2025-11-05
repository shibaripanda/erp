import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/Signin.dto';
import { RefreshTokenDto } from './dto/RefreshToken.dto';
import { UniversalJwtGuard } from './guards/universalJwtGuard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signin')
  async signin(@Body() data: SigninDto) {
    console.log(data);
    return await this.authService.signin(data);
  }

  @UseGuards(UniversalJwtGuard)
  @Post('/signin/new_token')
  getToken(@Body() data: RefreshTokenDto, @CurrentUser() user: User) {
    console.log(data);
    return this.authService.refreshTokens(user.id, data.refresh_token);
  }

  @Post('/signup')
  async signup(@Body() data: SigninDto) {
    console.log(data);
    return await this.authService.signup(data);
  }

  @Get('/logout')
  logout() {
    // return this.authService.signin();
  }
}
