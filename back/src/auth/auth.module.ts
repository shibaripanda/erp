import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { SessionModule } from 'src/session/session.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('SECRET_KEY')!,
        signOptions: { expiresIn: '10m' },
      }),
    }),
    UserModule,
    SessionModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
