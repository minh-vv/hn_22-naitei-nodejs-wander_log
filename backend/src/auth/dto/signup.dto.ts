import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class SignUpDto {
  @IsEmail({}, { message: i18nValidationMessage('validation.email_invalid') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.email_required') })
  email: string;

  @IsNotEmpty()
  name?: string;

  @MinLength(6, {
    message: i18nValidationMessage('validation.password_min_length'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.password_required'),
  })
  password: string;
}
