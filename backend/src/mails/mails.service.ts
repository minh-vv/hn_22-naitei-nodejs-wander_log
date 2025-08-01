import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class MailsService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async forgotPassword(mailData: {
    to: string;
    data: {
      token: string;
      user_name: string;
    };
  }): Promise<void> {
    await this.mailerService.sendMail({
      to: mailData.to,
      subject: 'Reset Password',
      templatePath: path.join(
        this.configService.get<string>('mailer.workingDirectory', {
          infer: true,
        }) || process.cwd(),
        'src',
        'mails',
        'templates',
        'reset-password.hbs',
      ),
      context: {
        username: mailData.data.user_name,
        resetLink: `${this.configService.get<string>('app.clientURL') || 'http://localhost:3001'}/reset-password?token=${mailData.data.token}`,
      },
    });
  }
}
