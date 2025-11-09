import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UniversalJwtGuard } from 'src/guards/universalJwtGuard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(UniversalJwtGuard)
  @Get('/info')
  info(@CurrentUser() user: User) {
    return { id: user.user_id };
  }
}
