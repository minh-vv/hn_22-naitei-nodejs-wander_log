import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailsModule } from './mails/mails.module';
import { MailerModule } from './mailer/mailer.module';
import { ItineraryModule } from './itinerary/itinerary.module';
import { PostsService } from './posts/posts.service';
import { PostsController } from './posts/posts.controller';
import { PostsModule } from './posts/posts.module';
import { ActivitiesModule } from './activities/activities.module';
import mailerConfig from './config/mailer.config';
import appConfig from './config/app.config';
import { i18nConfig } from './config/i18n.config';
import { I18nModule } from 'nestjs-i18n';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mailerConfig, appConfig],
    }),
    PrismaModule,
    MailerModule,
    AuthModule,
    MailsModule,
    ItineraryModule,
    PostsModule,
    ActivitiesModule,
    I18nModule.forRoot(i18nConfig)
  ],
  controllers: [AppController, PostsController],
  providers: [AppService, PostsService],
})
export class AppModule {}
