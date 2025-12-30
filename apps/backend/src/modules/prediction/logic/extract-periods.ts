import { DayLog } from '../domain/day-log';
import { isPeriodFlow } from '../domain/flow-level';
import { DetectedPeriod } from '../domain/detected-period';
import { daysBetween } from './date-utils';

const MAX_MISSING_DAYS = 3;

export function extractDetectedPeriods(logs: DayLog[]): DetectedPeriod[] {
  if (logs.length === 0) return [];

  const periods: DetectedPeriod[] = [];

  let current: DetectedPeriod | null = null;
  let missingStreak = 0;
  let lastDate: string | null = null;

  for (const log of logs) {
    if (lastDate) {
      const gap = daysBetween(lastDate, log.date) - 1;

      if (gap > 0 && current) {
        missingStreak += gap;

        if (missingStreak > MAX_MISSING_DAYS) {
          current.endDate = lastDate;
          current.totalSpanDays =
            daysBetween(current.startDate, current.endDate) + 1;
          current.confidenceFlags.push('FORCED_CLOSED_BY_GAP_CAP');

          if (current.bleedingDaysCount >= 2) {
            periods.push(current);
          }

          current = null;
          missingStreak = 0;
        } else {
          current.confidenceFlags.push('HAS_MISSING_DAYS');
        }
      }
    }

    if (isPeriodFlow(log.flowLevel)) {
      if (!current) {
        current = {
          startDate: log.date,
          endDate: log.date,
          bleedingDaysCount: 0,
          totalSpanDays: 0,
          confidenceFlags: [],
        };
        missingStreak = 0;
      }

      current.bleedingDaysCount += 1;
      current.endDate = log.date;
      missingStreak = 0;
    } else {
      if (current) {
        current.endDate = lastDate!;
        current.totalSpanDays =
          daysBetween(current.startDate, current.endDate) + 1;

        if (current.bleedingDaysCount >= 2) {
          periods.push(current);
        }

        current = null;
        missingStreak = 0;
      }
    }

    lastDate = log.date;
  }

  if (current) {
    current.totalSpanDays = daysBetween(current.startDate, current.endDate) + 1;

    if (current.bleedingDaysCount >= 2) {
      periods.push(current);
    }
  }

  return periods;
}
