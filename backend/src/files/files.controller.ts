import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('files')
export class FilesController {
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.originalname.split('.')[0]}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (
          !file.originalname.match(
            /\.(jpg|jpeg|png|gif|mp4|mov|avi|mkv|wmv|flv|webm)$/i,
          )
        ) {
          return callback(
            new Error('Only image and video files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @I18n() i18n: I18nContext,
  ) {
    const mediaUrls = files.map(
      (file) => `http://localhost:3000/uploads/${file.filename}`,
    );

    return {
      message: i18n.t('files.success'),
      mediaUrls,
    };
  }
}
