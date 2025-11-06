import { IsNotEmpty, IsString } from 'class-validator';

export class SigninDto {
  @IsString()
  @IsNotEmpty()
  readonly user_id: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly deviceId: string;
}
