import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  v2 as Cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';

type CloudinaryUploadResult = UploadApiResponse;

@Injectable()
export class UploadService {
  constructor(@Inject('CLOUDINARY') private cloudinary: typeof Cloudinary) {}

  private uploadBuffer(
    buffer: Buffer,
    options: Record<string, any>,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        options,
        (err: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (err) return reject(err);
          resolve(result);
        },
      );
      streamifier.createReadStream(buffer).pipe(upload);
    });
  }

  async uploadImage(file: Express.Multer.File, folder?: string) {
    if (!file) throw new BadRequestException('File is required');
    return this.uploadBuffer(file.buffer, {
      folder: folder ?? process.env.CLOUDINARY_FOLDER ?? 'uploads',
      resource_type: 'image',
      transformation: [{ fetch_format: 'auto', quality: 'auto' }],
    });
  }

  async uploadVideo(file: Express.Multer.File, folder?: string) {
    if (!file) throw new BadRequestException('File is required');
    return this.uploadBuffer(file.buffer, {
      folder: folder ?? process.env.CLOUDINARY_FOLDER ?? 'uploads/videos',
      resource_type: 'video',
    });
  }

  async deleteByPublicId(
    publicId: string,
    resourceType: 'image' | 'video' = 'image',
  ) {
    return this.cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }
}
