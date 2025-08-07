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
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';

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
    I18nModule.forRoot(i18nConfig),
    FilesModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ActivitiesModule,
    UsersModule,
  ],
  controllers: [AppController, PostsController, UsersController],
  providers: [AppService, PostsService, UsersService],
})
export class AppModule {}
