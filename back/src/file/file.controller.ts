import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'multer.config';
import { Response } from 'express';
import { UniversalJwtGuard } from 'src/guards/universalJwtGuard';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(UniversalJwtGuard)
  @Post('/upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const record = await this.fileService.createFileRecord(file);
    return { message: 'Файл успешно загружен', record };
  }

  @UseGuards(UniversalJwtGuard)
  @Get('/list')
  async getFileList(
    @Query('list_size') list_size: string,
    @Query('page') page: string,
  ) {
    return await this.fileService.getFiles(
      Number(page) || 1,
      Number(list_size) || 10,
    );
  }

  @UseGuards(UniversalJwtGuard)
  @Delete('/delete/:id')
  async deleteFileById(@Param('id') id: string) {
    await this.fileService.deleteFileById(Number(id));
  }

  @UseGuards(UniversalJwtGuard)
  @Get('/:id')
  async getFileDataById(@Param('id') id: string) {
    return await this.fileService.getFile(Number(id));
  }

  @UseGuards(UniversalJwtGuard)
  @Get('/download/:id')
  async downloadFileById(@Param('id') id: string, @Res() res: Response) {
    return await this.fileService.downloadFileById(Number(id), res);
  }

  @UseGuards(UniversalJwtGuard)
  @Put('/update/:id')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async updateFileById(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    const record = await this.fileService.updateFileRecord(file, Number(id));
    return { message: 'Файл успешно обновлен', record };
  }
}
