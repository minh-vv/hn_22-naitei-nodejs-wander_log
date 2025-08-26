import { Module, forwardRef } from '@nestjs/common';
import { InteractService } from './interact.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [forwardRef(() => NotificationsModule)],
  providers: [InteractService],
  exports: [InteractService],
})
export class InteractModule {}
