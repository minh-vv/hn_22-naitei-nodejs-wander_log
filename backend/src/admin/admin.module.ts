import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MailsModule } from 'src/mails/mails.module';

@Module({
    imports: [
    MailsModule,
  ],
  providers: [AdminService],
  controllers: [AdminController]
})
export class AdminModule {}
