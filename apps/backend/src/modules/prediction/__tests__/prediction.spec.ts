/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { computeCycleStats } from '../logic/cycle-stats';
import { predictNextPeriodWindow } from '../logic/predict-next-period';

describe('prediction logic', () => {
  it('computes average, variability, and confidence', () => {
    const cycles = [{ lengthDays: 28 }, { lengthDays: 30 }, { lengthDays: 29 }];

    const stats = computeCycleStats(cycles as any);

    expect(stats?.averageCycleLength).toBe(29);
    expect(stats?.confidence).toBeGreaterThan(0.5);
  });

  it('predicts a date window around expected start', () => {
    const window = predictNextPeriodWindow('2025-01-01', 28, 2);

    expect(window.expected).toBe('2025-01-29');
    expect(window.earliest).toBe('2025-01-27');
    expect(window.latest).toBe('2025-01-31');
  });
});
