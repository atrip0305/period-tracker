// apps/backend/src/modules/prediction/calendar/assemble-calendar.ts

import { PhaseResult } from '../domain/phase-types';
import { DayLog } from '@prisma/client';

export type CalendarDay = {
  date: string;
  isToday: boolean;

  log?: {
    hadPeriod: boolean;
    flow: DayLog['flow'];
  };

  phase?: PhaseResult['currentPhase'];

  prediction?: {
    type: 'OVULATION';
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  };

  flags?: string[];
};

type AssembleCalendarInput = {
  startDate: string;
  endDate: string;
  today: string;
  logs: DayLog[];
  phaseResult: PhaseResult;
};

export function assembleCalendarDays(
  input: AssembleCalendarInput,
): CalendarDay[] {
  const { startDate, endDate, today, logs, phaseResult } = input;

  const logMap = new Map(logs.map((log) => [toLocalISO(log.date), log]));

  const days = enumerateDates(startDate, endDate);

  return days.map((date) => {
    const log = logMap.get(date);

    const day: CalendarDay = {
      date,
      isToday: date === today,
    };

    if (log) {
      day.log = {
        hadPeriod: ['LIGHT', 'MEDIUM', 'HEAVY'].includes(log.flow),
        flow: log.flow,
      };
    }

    // Phase only for today
    if (date === today) {
      day.phase = phaseResult.currentPhase;
      if (phaseResult.flags?.length) {
        day.flags = [...phaseResult.flags];
      }
    }

    // Ovulation window
    if (
      phaseResult.ovulationWindow &&
      isBetween(
        date,
        phaseResult.ovulationWindow.earliest,
        phaseResult.ovulationWindow.latest,
      )
    ) {
      const windowConfidence = phaseResult.ovulationWindow?.confidence ?? 0;

      day.prediction = {
        type: 'OVULATION',
        confidence:
          windowConfidence < 0.4
            ? 'LOW'
            : windowConfidence < 0.7
              ? 'MEDIUM'
              : 'HIGH',
      };
    }

    return day;
  });
}

// ----------------- helpers -----------------

function enumerateDates(start: string, end: string): string[] {
  const dates: string[] = [];
  // eslint-disable-next-line prefer-const
  let current = new Date(start);

  const endDate = new Date(end);

  while (current <= endDate) {
    dates.push(toLocalISO(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function isBetween(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
