import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService, 
    private jwtService: JwtService,
    private readonly i18n: I18nService
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, password, name } = signUpDto;
        
    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new ConflictException(
        this.i18n.t('auth.email_exists', { lang: I18nContext.current()?.lang })
      );
    }

    const passwordHash = await hash(password, 10);
    const user = await this.prisma.user.create({
        data: { email, passwordHash, name },
    });

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(
        this.i18n.t('auth.invalid_credentials', { lang: I18nContext.current()?.lang })
      );
    }

    const passwordValid = await compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException(
        this.i18n.t('auth.invalid_credentials', { lang: I18nContext.current()?.lang })
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        this.i18n.t('auth.account_disabled', { lang: I18nContext.current()?.lang })
      );
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  }
}
