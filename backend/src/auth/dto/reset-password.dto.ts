import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ResetPasswordDto {
  @IsNotEmpty({ message: i18nValidationMessage('validation.token_required') })
  token: string;

  @MinLength(6, { message: i18nValidationMessage('validation.password_min_length', { min: 6 }) })
  @IsNotEmpty({ message: i18nValidationMessage('validation.password_required') })
  newPassword: string;
}