import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService } from '@nestjs/terminus';
import { ApiHealthCheck, DatabaseHealthCheck } from '.';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockResolvedValue({
              status: 'ok',
              info: {
                api: { status: 'up' },
                database: { status: 'up' },
              },
              error: {},
              details: {
                api: { status: 'up' },
                database: { status: 'up' },
              },
            }),
          },
        },
        {
          provide: ApiHealthCheck,
          useValue: {
            checkHealth: jest.fn().mockResolvedValue({ api: { status: 'up' } }),
          },
        },
        {
          provide: DatabaseHealthCheck,
          useValue: {
            checkHealth: jest
              .fn()
              .mockResolvedValue({ database: { status: 'up' } }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
