import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { isCuid } from '@paralleldrive/cuid2';

export function IsCuid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCuid',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (Array.isArray(value)) {
            return value.every((v) => typeof v === 'string' && isCuid(v));
          }
          return typeof value === 'string' && isCuid(value);
        },
        defaultMessage(_args: ValidationArguments) {
          return '$property must be a valid CUID';
        },
      },
    });
  };
}
