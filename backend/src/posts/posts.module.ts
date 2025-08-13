import { Module } from '@nestjs/common';
import { InteractModule } from 'src/interact/interact.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [InteractModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
