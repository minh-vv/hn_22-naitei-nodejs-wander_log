import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsNotEmpty()
  itineraryId: string;

  @IsArray()
  @IsUrl({}, { each: true })
  @IsNotEmpty({ each: true })
  mediaUrls: string[];
}
