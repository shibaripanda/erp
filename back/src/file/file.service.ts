import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { File } from '@prisma/client';
import { promises as fs } from 'fs';
import { Response } from 'express';
import * as path from 'path';
import { createReadStream } from 'fs';

@Injectable()
export class FileService {
  constructor(private prisma: PrismaService) {}

  async updateFileRecord(file: Express.Multer.File, id: number): Promise<File> {
    const { originalname, mimetype, size, path: filePath } = file;
    const extension = originalname.split('.').pop();
    const name = originalname.replace(/\.[^/.]+$/, '');
    const existFile = await this.prisma.file.findUnique({ where: { id } });
    if (!existFile) throw new NotFoundException('Файл не найден');
    try {
      const fullPath = path.resolve(existFile.path);
      await fs.unlink(fullPath);
    } catch (e) {
      console.warn(`Не удалось удалить файл с диска ${e}`);
    }
    return await this.prisma.file.update({
      where: { id },
      data: {
        name,
        extension: extension || 'FF',
        mimeType: mimetype,
        size,
        path: filePath,
      },
    });
  }

  async downloadFileById(id: number, res: Response) {
    const file = await this.prisma.file.findUnique({ where: { id } });

    if (!file) {
      throw new NotFoundException('Файл не найден');
    }

    const filePath = path.resolve(file.path);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.name}.${file.extension}"`,
    });

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  async getFile(id: number) {
    return await this.prisma.file.findUnique({ where: { id } });
  }

  async getFiles(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        skip,
        take: limit,
        orderBy: { uploadDate: 'desc' },
      }),
      this.prisma.file.count(),
    ]);
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      files,
    };
  }

  async deleteFileById(id: number) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('Файл не найден');
    try {
      const fullPath = path.resolve(file.path);
      await fs.unlink(fullPath);
    } catch (e) {
      console.warn(`Не удалось удалить файл с диска ${e}`);
    }
    await this.prisma.file.delete({ where: { id } });
    return { message: 'Файл успешно удалён', id };
  }

  async createFileRecord(file: Express.Multer.File): Promise<File> {
    const { originalname, mimetype, size, path } = file;
    const extension = originalname.split('.').pop();
    const name = originalname.replace(/\.[^/.]+$/, '');

    return await this.prisma.file.create({
      data: {
        name,
        extension: extension || 'FF',
        mimeType: mimetype,
        size,
        path,
      },
    });
  }
}
