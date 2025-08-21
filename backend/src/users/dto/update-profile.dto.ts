import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.name_required') })
  @MaxLength(100, {
    message: i18nValidationMessage('validation.name_max_length'),
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: i18nValidationMessage('validation.bio_max_length'),
  })
  bio?: string;

  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: i18nValidationMessage('validation.avatar_invalid_url') },
  )
  avatar?: string;

  @IsOptional()
  @IsUrl(
    {},
    { message: i18nValidationMessage('validation.cover_photo_invalid_url') },
  )
  coverPhoto?: string;
}
