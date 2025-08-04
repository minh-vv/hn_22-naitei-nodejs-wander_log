import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';
import { IsCuid } from 'src/common/validators/is-cuid.validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  mediaUrlsToAdd?: string[];

  @IsArray()
  @IsCuid({ each: true })
  @IsOptional()
  mediaIdsToDelete?: string[];
}
