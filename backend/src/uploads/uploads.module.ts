import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadsController } from './uploads.controller';
import { diskStorage } from 'multer';
import { generateRandomFilename } from '../utils/file-upload.utils'; 

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/itinerary-covers',
        filename: (req, file, cb) => {
          const filename = generateRandomFilename(file.originalname);
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
