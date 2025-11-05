import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UploadFileDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly mime_type: string;

  @IsNumber()
  @IsNotEmpty()
  readonly size: number;

  @IsDate()
  @IsNotEmpty()
  readonly date: Date;
}
