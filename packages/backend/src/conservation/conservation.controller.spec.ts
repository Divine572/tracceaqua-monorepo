import { Test, TestingModule } from '@nestjs/testing';
import { ConservationController } from './conservation.controller';

describe('ConservationController', () => {
  let controller: ConservationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConservationController],
    }).compile();

    controller = module.get<ConservationController>(ConservationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
