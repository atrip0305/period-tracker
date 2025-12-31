import { deriveCycles } from '../logic/derive-cycles';
import { DetectedPeriod } from '../domain/detected-period';

describe('deriveCycles', () => {
  it('derives start-to-start cycle lengths', () => {
    const periods: DetectedPeriod[] = [
      {
        startDate: '2025-01-01',
        endDate: '2025-01-05',
        bleedingDaysCount: 3,
        totalSpanDays: 5,
        confidenceFlags: [],
      },
      {
        startDate: '2025-01-29',
        endDate: '2025-02-02',
        bleedingDaysCount: 4,
        totalSpanDays: 5,
        confidenceFlags: [],
      },
    ];

    const cycles = deriveCycles(periods);

    expect(cycles).toHaveLength(1);
    expect(cycles[0].lengthDays).toBe(28);
  });

  it('returns empty array if fewer than two periods', () => {
    const cycles = deriveCycles([]);
    expect(cycles).toHaveLength(0);
  });
});
