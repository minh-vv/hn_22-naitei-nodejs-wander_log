import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { MailerService } from 'src/mailer/mailer.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class MailsService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService, 
  ) {}

  async forgotPassword(mailData: {
    to: string;
    data: {
      token: string;
      user_name: string;
    };
    lang?: string;
  }): Promise<void> {
    const subject = this.i18n.t('auth.reset_password_subject', {
      lang: mailData.lang || 'en',
    });

    const greeting = this.i18n.t('auth.reset_password_email_greeting', {
      lang: mailData.lang || 'en',
    });

    const content = this.i18n.t('auth.reset_password_email_content', {
      lang: mailData.lang || 'en',
    });

    const buttonText = this.i18n.t('auth.reset_password_button', {
      lang: mailData.lang || 'en',
    });

    const footer = this.i18n.t('auth.reset_password_email_footer', {
      lang: mailData.lang || 'en',
    });

    const expiry = this.i18n.t('auth.reset_password_expiry', {
      lang: mailData.lang || 'en',
    });

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: subject,
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
        subject: subject,
        username: mailData.data.user_name,
        resetLink: `${this.configService.get<string>('app.clientURL') || 'http://localhost:3001'}/reset-password?token=${mailData.data.token}`,
        greeting: greeting,
        content: content,
        buttonText: buttonText,
        footer: footer,
        expiry: expiry,
      },
    });
  }
  async sendUserStatusUpdate(mailData: {
    to: string;
    data: {
      user_name: string;
      new_status: 'activated' | 'deactivated'; 
      reason?: string; 
    };
  }): Promise<void> {
    const subject = this.i18n.t(
      mailData.data.new_status === 'activated'
        ? 'mail.account_activated_subject'
        : 'mail.account_deactivated_subject'
    );

    const newStatusText = this.i18n.t(
      mailData.data.new_status === 'activated'
        ? 'mail.status_activated_text'
        : 'mail.status_deactivated_text'
    );

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: subject,
      templatePath: path.join(
        this.configService.get<string>('mailer.workingDirectory', {
          infer: true,
        }) || process.cwd(),
        'src',
        'mails',
        'templates',
        'user-status-update.hbs', 
      ),
      context: {
        username: mailData.data.user_name,
        new_status_text: newStatusText, 
        reason: mailData.data.reason,
      },
    });
  }

  async sendItineraryDeletionNotification(mailData: {
    to: string;
    data: {
      user_name: string;
      itinerary_title: string;
    };
  }): Promise<void> {
    const subject = this.i18n.t('mail.itinerary_deleted_subject');

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: subject,
      templatePath: path.join(
        this.configService.get<string>('mailer.workingDirectory', {
          infer: true,
        }) || process.cwd(),
        'src',
        'mails',
        'templates',
        'itinerary-deleted.hbs', 
      ),
      context: {
        username: mailData.data.user_name,
        itinerary_title: mailData.data.itinerary_title,
      },
    });
  }
}
