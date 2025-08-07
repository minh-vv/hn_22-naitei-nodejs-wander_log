import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsCustomUrl } from 'src/common/validators/is-custom-url.validator';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsNotEmpty()
  itineraryId: string;

  @IsArray()
  @IsCustomUrl({ each: true })
  @IsNotEmpty({ each: true })
  mediaUrls: string[];
}
