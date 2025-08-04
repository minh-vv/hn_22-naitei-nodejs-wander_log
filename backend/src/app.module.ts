import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CustomI18nModule } from './i18n/i18n.module';
import { MailsModule } from './mails/mails.module';
import { MailerModule } from './mailer/mailer.module';
import { PostsService } from './posts/posts.service';
import { PostsController } from './posts/posts.controller';
import { PostsModule } from './posts/posts.module';
import mailerConfig from './config/mailer.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mailerConfig, appConfig],
    }),
    CustomI18nModule,
    PrismaModule, 
    MailerModule,
    AuthModule, 
    MailsModule, PostsModule
  ],
  controllers: [AppController, PostsController],
  providers: [AppService, PostsService],
})
export class AppModule {}
