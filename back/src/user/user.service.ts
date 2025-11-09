import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
// import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: number): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async getUserByUserId(user_id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { user_id } });
  }

  async create(user_id: string, password: string): Promise<User> {
    return await this.prisma.user.create({
      data: {
        user_id,
        password,
      },
    });
  }
}
