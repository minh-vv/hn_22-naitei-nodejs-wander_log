import { Module } from '@nestjs/common';
import { InteractModule } from 'src/interact/interact.module';
import { UploadModule } from 'src/uploads/uploads.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [InteractModule, UploadModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
