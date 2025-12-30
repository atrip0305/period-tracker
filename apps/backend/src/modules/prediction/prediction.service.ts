import { Injectable } from '@nestjs/common';
import { extractDetectedPeriods } from './logic/extract-periods';
import { deriveCycles } from './logic/derive-cycles';
import { computeCycleStats } from './logic/cycle-stats';
import { predictNextPeriodWindow } from './logic/predict-next-period';
import { DayLog } from './domain/day-log';

@Injectable()
export class PredictionService {
  analyze(logs: DayLog[]) {
    const periods = extractDetectedPeriods(logs);
    const cycles = deriveCycles(periods);

    if (periods.length === 0) {
      return { periods, cycles, prediction: null };
    }

    const stats = computeCycleStats(cycles);
    if (!stats) {
      return { periods, cycles, prediction: null };
    }

    const lastPeriodStart = periods[periods.length - 1].startDate;

    const window = predictNextPeriodWindow(
      lastPeriodStart,
      stats.averageCycleLength,
      stats.variabilityDays,
    );

    return {
      periods,
      cycles,
      prediction: {
        ...stats,
        nextPeriodWindow: window,
      },
    };
  }
}
