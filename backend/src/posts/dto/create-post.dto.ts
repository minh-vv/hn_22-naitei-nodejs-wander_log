import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsNotEmpty()
  itineraryId: string;

  @IsArray()
  @IsNotEmpty({ each: true })
  mediaFiles: { url: string; publicId: string }[];
}
