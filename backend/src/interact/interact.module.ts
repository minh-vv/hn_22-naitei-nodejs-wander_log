import { Module } from '@nestjs/common';
import { InteractService } from './interact.service';

@Module({
  providers: [InteractService],
  exports: [InteractService],
})
export class InteractModule {}
