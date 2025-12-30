import { addDays } from './date-utils';

export function predictNextPeriodWindow(
  lastPeriodStart: string,
  avgCycleLength: number,
  variabilityDays: number,
) {
  const expected = addDays(lastPeriodStart, avgCycleLength);
  const radius = Math.max(variabilityDays, 2);

  return {
    expected,
    earliest: addDays(expected, -radius),
    latest: addDays(expected, radius),
  };
}
