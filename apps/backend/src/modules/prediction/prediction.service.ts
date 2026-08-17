import { Injectable } from '@nestjs/common';

import { extractDetectedPeriods } from './logic/extract-periods';
import { deriveCycles } from './logic/derive-cycles';
import { computeCycleStats } from './logic/cycle-stats';
import { predictNextPeriodWindow } from './logic/predict-next-period';
import { derivePhaseAndWindow } from './logic/derive-phases';

import { DayLog } from './domain/day-log';

@Injectable()
export class PredictionService {
  analyze(logs: DayLog[]) {
    const periods = extractDetectedPeriods(logs);
    const cycles = deriveCycles(periods);

    /*
     * No detected period means there is nothing
     * meaningful to predict yet.
     */
    if (periods.length === 0) {
      return {
        periods,
        cycles,
        prediction: null,
        phase: null,
      };
    }

    /*
     * A single detected period is not enough
     * to derive a cycle length.
     */
    const stats = computeCycleStats(cycles);

    if (!stats) {
      return {
        periods,
        cycles,
        prediction: null,
        phase: null,
      };
    }

    const lastPeriod = periods[periods.length - 1];

    const window = predictNextPeriodWindow(
      lastPeriod.startDate,
      stats.averageCycleLength,
      stats.variabilityDays,
    );

    const today = new Date().toISOString().slice(0, 10);

    const phase = derivePhaseAndWindow({
      today,
      lastPeriod,
      avgCycleLength: stats.averageCycleLength,
      confidence: stats.confidence,
    });

    return {
      periods,
      cycles,

      prediction: {
        ...stats,
        nextPeriodWindow: window,
      },

      phase,
    };
  }
}