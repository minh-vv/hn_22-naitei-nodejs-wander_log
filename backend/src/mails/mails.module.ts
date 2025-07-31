import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailsService } from './mails.service';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [ConfigModule, MailerModule],
  providers: [MailsService],
  exports: [MailsService],
})
export class MailsModule {}
