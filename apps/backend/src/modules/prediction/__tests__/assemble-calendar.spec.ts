/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// apps/backend/src/modules/prediction/__tests__/assemble-calendar.spec.ts

import { assembleCalendarDays } from '../calendar/assemble-calendar';
import { PhaseResult } from '../domain/phase-types';

// minimal helper to create DayLog-like objects
function log(date: string, flow: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    date: new Date(date),
    flow,
  } as any;
}

describe('assembleCalendarDays', () => {
  it('includes factual log with derived hadPeriod', () => {
    const phaseResult: PhaseResult = {
      currentPhase: 'FOLLICULAR',
      explanation: 'test explanation',
      flags: [],
    };

    const days = assembleCalendarDays({
      startDate: '2025-01-01',
      endDate: '2025-01-03',
      today: '2025-01-02',
      logs: [log('2025-01-02', 'HEAVY')],
      phaseResult,
    });

    const day = days.find((d) => d.date === '2025-01-02')!;
    expect(day.log).toEqual({
      hadPeriod: true,
      flow: 'HEAVY',
    });
  });

  it('marks today correctly', () => {
    const phaseResult: PhaseResult = {
      currentPhase: 'FOLLICULAR',
      explanation: 'test explanation',
      flags: [],
    };

    const days = assembleCalendarDays({
      startDate: '2025-01-01',
      endDate: '2025-01-03',
      today: '2025-01-02',
      logs: [],
      phaseResult,
    });

    expect(days.find((d) => d.date === '2025-01-02')!.isToday).toBe(true);
    expect(days.find((d) => d.date === '2025-01-01')!.isToday).toBe(false);
  });

  it('marks ovulation window with confidence', () => {
    const phaseResult: PhaseResult = {
      currentPhase: 'FOLLICULAR',
      explanation: 'test explanation',
      flags: [],
      ovulationWindow: {
        earliest: '2025-01-10',
        latest: '2025-01-14',
        confidence: 0.6,
      },
    };

    const days = assembleCalendarDays({
      startDate: '2025-01-09',
      endDate: '2025-01-15',
      today: '2025-01-12',
      logs: [],
      phaseResult,
    });

    const ovulationDay = days.find((d) => d.date === '2025-01-12')!;
    expect(ovulationDay.prediction).toEqual({
      type: 'OVULATION',
      confidence: 'MEDIUM',
    });
  });

  it('applies phase and flags only to today', () => {
    const phaseResult: PhaseResult = {
      currentPhase: 'MENSTRUAL',
      explanation: 'test explanation',
      flags: ['OVERLAP_WITH_MENSES'],
      ovulationWindow: {
        earliest: '2025-01-10',
        latest: '2025-01-14',
        confidence: 0.9,
      },
    };

    const days = assembleCalendarDays({
      startDate: '2025-01-10',
      endDate: '2025-01-12',
      today: '2025-01-11',
      logs: [],
      phaseResult,
    });

    const todayDay = days.find((d) => d.date === '2025-01-11')!;
    const otherDay = days.find((d) => d.date === '2025-01-10')!;

    expect(todayDay.phase).toBe('MENSTRUAL');
    expect(todayDay.flags).toContain('OVERLAP_WITH_MENSES');
    expect(otherDay.phase).toBeUndefined();
  });

  it('allows fact and prediction to coexist on the same day', () => {
    const phaseResult: PhaseResult = {
      currentPhase: 'MENSTRUAL',
      explanation: 'test explanation',
      flags: ['OVERLAP_WITH_MENSES'],
      ovulationWindow: {
        earliest: '2025-01-11',
        latest: '2025-01-13',
        confidence: 0.3,
      },
    };

    const days = assembleCalendarDays({
      startDate: '2025-01-10',
      endDate: '2025-01-14',
      today: '2025-01-12',
      logs: [log('2025-01-12', 'HEAVY')],
      phaseResult,
    });

    const day = days.find((d) => d.date === '2025-01-12')!;
    expect(day.log?.hadPeriod).toBe(true);
    expect(day.prediction?.type).toBe('OVULATION');
  });
});
