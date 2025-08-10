import { Test, TestingModule } from '@nestjs/testing';
import { InteractService } from './interact.service';

describe('InteractService', () => {
  let service: InteractService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InteractService],
    }).compile();

    service = module.get<InteractService>(InteractService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
