import { Test, TestingModule } from '@nestjs/testing';
import { RoleApplicationsController } from './role-applications.controller';

describe('RoleApplicationsController', () => {
  let controller: RoleApplicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleApplicationsController],
    }).compile();

    controller = module.get<RoleApplicationsController>(RoleApplicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
