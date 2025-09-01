import { Test, TestingModule } from '@nestjs/testing';
import { ConservationService } from './conservation.service';

describe('ConservationService', () => {
  let service: ConservationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConservationService],
    }).compile();

    service = module.get<ConservationService>(ConservationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
