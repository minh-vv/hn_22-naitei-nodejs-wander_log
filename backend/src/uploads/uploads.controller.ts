import {
  Controller,
  Post,
  Delete,
  Body,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './uploads.service';
import * as multer from 'multer';

const memoryStorage = multer.memoryStorage();

const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_MIME = ['video/mp4', 'video/quicktime', 'video/webm'];

function fileFilterImage(_req, file, cb) {
  if (IMAGE_MIME.includes(file.mimetype)) cb(null, true);
  else cb(new BadRequestException('Only image files are allowed'), false);
}

function fileFilterVideo(_req, file, cb) {
  if (VIDEO_MIME.includes(file.mimetype)) cb(null, true);
  else cb(new BadRequestException('Only video files are allowed'), false);
}

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage,
      fileFilter: fileFilterImage,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const result = await this.uploadService.uploadImage(file);
    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
    };
  }

  @Post('video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage,
      fileFilter: fileFilterVideo,
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    const result = await this.uploadService.uploadVideo(file);
    return {
      public_id: result.public_id,
      url: result.secure_url,
      duration: result.duration,
      bytes: result.bytes,
      format: result.format,
    };
  }

  @Post('images/batch')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage,
      fileFilter: fileFilterImage,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadImagesBatch(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('No files');
    const uploaded = await Promise.all(
      files.map((f) => this.uploadService.uploadImage(f)),
    );
    return uploaded.map((r) => ({ public_id: r.public_id, url: r.secure_url }));
  }

  @Delete()
  async delete(
    @Body('public_id') publicId: string,
    @Body('type') type: 'image' | 'video' = 'image',
  ) {
    if (!publicId) throw new BadRequestException('public_id is required');
    const res = await this.uploadService.deleteByPublicId(publicId, type);
    return res;
  }
}
