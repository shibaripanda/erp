import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async update(
    sessionId: number,
    refreshTokenHash: string,
    newExpiresAt: Date,
  ) {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash,
        expiresAt: newExpiresAt,
      },
    });
  }

  async create(
    userId: number,
    refreshTokenHash: string,
    deviceId: string,
    expiresAt: Date,
  ) {
    await this.prisma.session.deleteMany({
      where: {
        userId,
        deviceId,
      },
    });
    return this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        deviceId,
        expiresAt,
      },
    });
  }

  async delete(sessionId: number) {
    return this.prisma.session.delete({
      where: { id: sessionId },
    });
  }

  async findByRefreshToken(refreshToken: string) {
    const sessions = await this.prisma.session.findMany();
    console.log(sessions);

    for (const session of sessions) {
      const isValid = await bcrypt.compare(
        refreshToken,
        session.refreshTokenHash,
      );
      if (isValid) return session;
    }

    return null;
  }
}
