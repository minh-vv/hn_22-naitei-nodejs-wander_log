import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly i18n: I18nService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; 

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException(
        this.i18n.t('auth.forbidden_access', { 
          lang: I18nContext.current()?.lang 
        })
      );
    }

    return true;
  }
}
