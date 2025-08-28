import { Module, forwardRef } from '@nestjs/common';
import { InteractService } from './interact.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => NotificationsModule)
  ],
  providers: [InteractService],
  exports: [InteractService],
})
export class InteractModule {}
