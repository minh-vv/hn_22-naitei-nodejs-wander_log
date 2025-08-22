import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('uploads')
export class UploadsController {
  @Post('itinerary-cover')
  @UseInterceptors(FileInterceptor('file')) 
  uploadItineraryCover(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File not provided.');
    }
    return { url: `/uploads/itinerary-covers/${file.filename}` };
  }
}
