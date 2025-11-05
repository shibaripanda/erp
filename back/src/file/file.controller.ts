import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { FileService } from './file.service';
import { UploadFileDto } from './dto/UploadFile.dto';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('/upload')
  signin(@Body() data: UploadFileDto) {
    console.log(data);
    // return this.authService.signin();
  }

  @Get('/list')
  getFileList(@Body() data: UploadFileDto) {
    console.log(data);
    // return this.authService.signin(); list_size 10, page 1
  }

  @Delete('/delete')
  deleteFileById() {
    // return this.authService.signin(); :id
  }

  @Get('/file')
  getFileDataById() {
    // return this.authService.signin(); :id
  }

  @Get('/download')
  downloadFileById() {
    // return this.authService.signin(); :id
  }

  @Put('/update')
  updateFileById() {
    // return this.authService.signin(); :id
  }
}
