import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API information', () => {
      expect(appController.getApiInfo()).toEqual({
        name: 'TracceAqua API',
        version: '1.0.0',
        description: 'Blockchain Seafood Traceability System',
        environment: 'development',
        timestamp: expect.any(String),
        documentation: '/api/docs',
        endpoints: {
          health: '/health',
          stats: '/stats',
          auth: '/api/auth',
          conservation: '/api/conservation',
          supplyChain: '/api/supply-chain',
          files: '/api/files',
          blockchain: '/api/blockchain',
          admin: '/api/admin',
        },
        features: {
          blockchain: true,
          ipfs: true,
          authentication: true,
          roleBasedAccess: true,
          fileUpload: true,
          qrCodeGeneration: true,
          consumerFeedback: true,
        },
      });
    });
  });
});
