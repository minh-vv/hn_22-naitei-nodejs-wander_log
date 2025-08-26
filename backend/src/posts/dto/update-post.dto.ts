import { IsArray, IsOptional, IsString } from 'class-validator';
import { IsCuid } from 'src/common/validators/is-cuid.validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsOptional()
  mediaFilesToAdd?: { url: string; publicId: string }[];

  @IsArray()
  @IsCuid({ each: true })
  @IsOptional()
  mediaIdsToDelete?: string[];
}
