import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { BookmarkType } from '@prisma/client';

export class CreateBookmarkDto {
  @IsEnum(BookmarkType)
  @IsNotEmpty()
  type: BookmarkType;

  @IsString()
  @IsNotEmpty()
  itemId: string;
}
