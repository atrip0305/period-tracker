import { DetectedPeriod } from '../domain/detected-period';
import { DetectedCycle } from '../domain/detected-cycle';
import { daysBetween } from './date-utils';

export function deriveCycles(periods: DetectedPeriod[]): DetectedCycle[] {
  if (periods.length < 2) return [];

  const cycles: DetectedCycle[] = [];

  for (let i = 0; i < periods.length - 1; i++) {
    const start = periods[i].startDate;
    const end = periods[i + 1].startDate;

    cycles.push({
      startDate: start,
      endDate: end,
      lengthDays: daysBetween(start, end),
    });
  }

  return cycles;
}
