/* eslint-disable prettier/prettier */
import { addDays } from './date-utils';
import { PhaseResult, PhaseFlag } from '../domain/phase-types';
import { DetectedPeriod } from '../domain/detected-period';

interface PhaseInputs {
  today: string; // injected for testability
  lastPeriod: DetectedPeriod;
  avgCycleLength: number;
  confidence: number;
}

function toDay(date: string): number {
  return new Date(date).getTime();
}

export function derivePhaseAndWindow(input: PhaseInputs): PhaseResult {
  const { today, lastPeriod, avgCycleLength, confidence } = input;
  const flags: PhaseFlag[] = [];

  // Ovulation window (Option B-Light)
  const center = addDays(lastPeriod.startDate, avgCycleLength - 14);

  // Degrade window if sparse data
  const radius = confidence < 0.4 ? 4 : 2;

  const ovulationWindow = {
    earliest: addDays(center, -radius),
    latest: addDays(center, radius),
    confidence,
  };

  // Menstrual phase ALWAYS takes priority (date-safe)
  if (
    toDay(today) >= toDay(lastPeriod.startDate) &&
    toDay(today) <= toDay(lastPeriod.endDate)
  ) {
    // Overlap conflict handling
    if (
      toDay(lastPeriod.endDate) >= toDay(ovulationWindow.earliest)
    ) {
      flags.push('OVERLAP_WITH_MENSES');
    }

    return {
      currentPhase: 'MENSTRUAL',
      ovulationWindow,
      flags,
      explanation:
        'You are currently menstruating. Any fertility estimates are shown as a window of probability and may overlap with bleeding in shorter cycles.',
    };
  }

  // Guard: Highly irregular cycles (degrades inference, does NOT override reality)
  if (avgCycleLength < 21) {
    flags.push('HIGHLY_IRREGULAR');
    return {
      currentPhase: 'FOLLICULAR',
      flags,
      explanation:
        'Your cycle length is highly variable or unusually short. Phase estimates may be unreliable. Consider consulting a healthcare professional for personalized guidance.',
    };
  }

  // Ovulation window phase (date-safe)
  if (
    toDay(today) >= toDay(ovulationWindow.earliest) &&
    toDay(today) <= toDay(ovulationWindow.latest)
  ) {
    if (confidence < 0.4) flags.push('LOW_CONFIDENCE');
    return {
      currentPhase: 'OVULATION_WINDOW',
      ovulationWindow,
      flags,
      explanation:
        'This is an estimated window of higher probability for ovulation, based on your average cycle length. It is not a guaranteed ovulation date.',
    };
  }

  // Follicular phase
  if (toDay(today) < toDay(ovulationWindow.earliest)) {
    return {
      currentPhase: 'FOLLICULAR',
      ovulationWindow,
      flags,
      explanation:
        'Your body is in the follicular phase, the time leading up to the release of an egg.',
    };
  }

  // Luteal phase
  return {
    currentPhase: 'LUTEAL',
    ovulationWindow,
    flags,
    explanation:
      'This phase typically follows ovulation and lasts until the next period.',
  };
}
