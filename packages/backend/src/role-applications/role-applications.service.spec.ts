import { Test, TestingModule } from '@nestjs/testing';
import { RoleApplicationsService } from './role-applications.service';

describe('RoleApplicationsService', () => {
  let service: RoleApplicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleApplicationsService],
    }).compile();

    service = module.get<RoleApplicationsService>(RoleApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
