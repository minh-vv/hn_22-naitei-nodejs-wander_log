import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsCustomUrl(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCustomUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          try {
            const url = new URL(value);
            return ['http:', 'https:'].includes(url.protocol);
          } catch (e) {
            return false;
          }
        },
        defaultMessage(_args: ValidationArguments) {
          return 'Each media URL must be a valid URL (http/https)';
        },
      },
    });
  };
}
