import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { randomBytes } from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailsService } from 'src/mails/mails.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly i18n: I18nService,
    private readonly mailsService: MailsService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, password, name } = signUpDto;

    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new ConflictException(
        this.i18n.t('auth.email_exists', { lang: I18nContext.current()?.lang }),
      );
    }

    const passwordHash = await hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, name },
    });

    const payload = { sub: user.id, email: user.email, role: user.role, authProvider: user.authProvider };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider,
      },
      token,
    };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(
        this.i18n.t('auth.invalid_credentials', {
          lang: I18nContext.current()?.lang,
        }),
      );
    }

    const passwordValid = await compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException(
        this.i18n.t('auth.invalid_credentials', {
          lang: I18nContext.current()?.lang,
        }),
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        this.i18n.t('auth.account_disabled', {
          lang: I18nContext.current()?.lang,
        }),
      );
    }

    const payload = { sub: user.id, email: user.email, role: user.role, authProvider: user.authProvider };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider,
      },
      token,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(
        this.i18n.t('auth.user_not_found', {
          lang: I18nContext.current()?.lang,
        }),
      );
    }

    const resetToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);

    console.log('Generated reset token:', resetToken.substring(0, 10) + '...');
    console.log('Token expires at:', expiresAt);

    await this.prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    const createdReset = await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    console.log('Created password reset record with ID:', createdReset.id);

    await this.mailsService.forgotPassword({
      to: user.email,
      data: {
        token: resetToken,
        user_name: user.name || user.email.split('@')[0],
      },
      lang: I18nContext.current()?.lang,
    });

    return {
      message: this.i18n.t('auth.reset_password_email_sent', {
        lang: I18nContext.current()?.lang,
      }),
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    console.log('Reset password attempt with token:', token ? token.substring(0, 10) + '...' : 'null');

    if (!token || token.trim() === '') {
      throw new BadRequestException(
        this.i18n.t('validation.token_required', {
          lang: I18nContext.current()?.lang,
        }),
      );
    }

    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { token: token.trim() },
      include: { user: true },
    });

    if (!passwordReset) {
      console.log('Password reset record not found for token');
      throw new BadRequestException(
        this.i18n.t('auth.invalid_reset_token', {
          lang: I18nContext.current()?.lang,
        }),
      );
    }

    if (passwordReset.expiresAt < new Date()) {
      console.log('Password reset token expired:', passwordReset.expiresAt);
      await this.prisma.passwordReset.delete({
        where: { id: passwordReset.id },
      });
      throw new BadRequestException(
        this.i18n.t('auth.reset_token_expired', {
          lang: I18nContext.current()?.lang,
        }),
      );
    }

    const passwordHash = await hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: passwordReset.userId },
      data: { passwordHash },
    });

    await this.prisma.passwordReset.delete({
      where: { id: passwordReset.id },
    });

    console.log('Password reset successful for user:', passwordReset.userId);

    return {
      message: this.i18n.t('auth.password_reset_success', {
        lang: I18nContext.current()?.lang,
      }),
    };
  }

  async checkActiveResetTokens(email?: string) {
    const whereClause = email ? {
      user: { email },
      expiresAt: { gt: new Date() }
    } : {
      expiresAt: { gt: new Date() }
    };

    const activeTokens = await this.prisma.passwordReset.findMany({
      where: whereClause,
      include: { user: { select: { email: true } } },
      orderBy: { expiresAt: 'desc' }
    });

    const tokenInfo = activeTokens.map(t => ({
      id: t.id,
      email: t.user.email,
      token: t.token.substring(0, 10) + '...',
      expiresAt: t.expiresAt,
    }));

    console.log('Active reset tokens:', tokenInfo);

    return tokenInfo;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        this.i18n.t('auth.passwords_do_not_match', {
          lang: I18nContext.current()?.lang,
        }),
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(
        this.i18n.t('auth.user_not_found', {
          lang: I18nContext.current()?.lang,
        }),
      );
    }

    if (user.authProvider === 'GOOGLE' || !user.passwordHash) {
      throw new BadRequestException(
        this.i18n.t('auth.oauth_user_cannot_change_password', {
          lang: I18nContext.current()?.lang,
        }),
      );
    }

    const currentPasswordValid = await compare(currentPassword, user.passwordHash);
    if (!currentPasswordValid) {
      throw new UnauthorizedException(
        this.i18n.t('auth.current_password_incorrect', {
          lang: I18nContext.current()?.lang,
        }),
      );
    }

    const samePassword = await compare(newPassword, user.passwordHash);
    if (samePassword) {
      throw new BadRequestException(
        this.i18n.t('auth.new_password_same_as_current', {
          lang: I18nContext.current()?.lang,
        }),
      );
    }

    const newPasswordHash = await hash(newPassword, 10);
    
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return {
      message: this.i18n.t('auth.password_changed_success', {
        lang: I18nContext.current()?.lang,
      }),
    };
  }

  async validateOAuthUser(oauthUser: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
    authProvider: string;
  }) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: oauthUser.googleId }, { email: oauthUser.email }],
      },
    });

    if (user) {
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: oauthUser.googleId,
            authProvider: 'GOOGLE',
            avatar: oauthUser.avatar || user.avatar,
          },
        });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          googleId: oauthUser.googleId,
          email: oauthUser.email,
          name: oauthUser.name,
          avatar: oauthUser.avatar,
          authProvider: 'GOOGLE',
          role: 'USER',
        },
      });
    }

    const payload = { sub: user.id, email: user.email, role: user.role, authProvider: user.authProvider };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider,
      },
      token,
    };
  }
}
