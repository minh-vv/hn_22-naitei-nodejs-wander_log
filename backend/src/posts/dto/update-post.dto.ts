import { IsArray, IsOptional, IsString } from 'class-validator';
import { IsCuid } from 'src/common/validators/is-cuid.validator';
import { IsCustomUrl } from 'src/common/validators/is-custom-url.validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsCustomUrl({ each: true })
  @IsOptional()
  mediaUrlsToAdd?: string[];

  @IsArray()
  @IsCuid({ each: true })
  @IsOptional()
  mediaIdsToDelete?: string[];
}
