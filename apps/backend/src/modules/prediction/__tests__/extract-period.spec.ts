import { extractDetectedPeriods } from '../logic/extract-periods';
import { FlowLevel } from '../domain/flow-level';
import { DayLog } from '../domain/day-log';

describe('extractDetectedPeriods', () => {
  it('detects a normal multi-day period', () => {
    const logs: DayLog[] = [
      { date: '2025-01-01', flowLevel: FlowLevel.HEAVY },
      { date: '2025-01-02', flowLevel: FlowLevel.MEDIUM },
      { date: '2025-01-03', flowLevel: FlowLevel.NONE },
    ];

    const periods = extractDetectedPeriods(logs);

    expect(periods).toHaveLength(1);
    expect(periods[0].startDate).toBe('2025-01-01');
    expect(periods[0].endDate).toBe('2025-01-02');
  });

  it('ignores spotting as a boundary', () => {
    const logs: DayLog[] = [
      { date: '2025-01-01', flowLevel: FlowLevel.HEAVY },
      { date: '2025-01-02', flowLevel: FlowLevel.SPOTTING },
    ];

    const periods = extractDetectedPeriods(logs);
    expect(periods).toHaveLength(0);
  });

  it('keeps period open across missing days within cap', () => {
    const logs: DayLog[] = [
      { date: '2025-01-01', flowLevel: FlowLevel.HEAVY },
      { date: '2025-01-04', flowLevel: FlowLevel.MEDIUM }, // 2 missing days
    ];

    const periods = extractDetectedPeriods(logs);
    expect(periods).toHaveLength(1);
    expect(periods[0].confidenceFlags).toContain('HAS_MISSING_DAYS');
  });

  it('force-closes period when missing days exceed cap', () => {
    const logs: DayLog[] = [
      { date: '2025-01-01', flowLevel: FlowLevel.HEAVY },
      { date: '2025-01-06', flowLevel: FlowLevel.MEDIUM }, // gap > 3
    ];

    const periods = extractDetectedPeriods(logs);
    expect(periods).toHaveLength(0);
  });

  it('discards single-day bleeding', () => {
    const logs: DayLog[] = [
      { date: '2025-01-01', flowLevel: FlowLevel.HEAVY },
      { date: '2025-01-02', flowLevel: FlowLevel.NONE },
    ];

    const periods = extractDetectedPeriods(logs);
    expect(periods).toHaveLength(0);
  });
});
