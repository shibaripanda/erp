import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     secret: config.get<string>('SECRET_KEY')!,
    //     signOptions: { expiresIn: '10m' },
    //   }),
    // }),
    JwtModule.register({
      secret: process.env.SECRET_KEY || 'dev_secret_key',
      signOptions: { expiresIn: '10m' },
    }),
  ],
  exports: [JwtModule],
})
export class JwtConfigModule {}
