/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { LogsService } from '../../logs/logs.service';
import { FlowLevel } from '../../logs/dto/daily-log.dto';

describe('LogsService', () => {
  const prisma = {
    dayLog: {
      upsert: jest.fn(),
    },
  } as any;

  const service = new LogsService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('rejects future dates', async () => {
    await expect(
      service.upsertDailyLog({
        date: '2999-01-01',
        hadPeriod: false,
        flow: FlowLevel.NONE,
      } as any),
    ).rejects.toThrow();
  });

  it('rejects spotting when hadPeriod is true', async () => {
    await expect(
      service.upsertDailyLog({
        date: '2025-01-01',
        hadPeriod: true,
        flow: FlowLevel.SPOTTING,
      } as any),
    ).rejects.toThrow();
  });

  it('allows spotting when hadPeriod is false', async () => {
    prisma.dayLog.upsert.mockResolvedValue({});

    await service.upsertDailyLog({
      date: '2025-01-01',
      hadPeriod: false,
      flow: FlowLevel.SPOTTING,
    } as any);

    expect(prisma.dayLog.upsert).toHaveBeenCalled();
  });

  it('requires flow when hadPeriod is true', async () => {
    await expect(
      service.upsertDailyLog({
        date: '2025-01-01',
        hadPeriod: true,
      } as any),
    ).rejects.toThrow();
  });
});
