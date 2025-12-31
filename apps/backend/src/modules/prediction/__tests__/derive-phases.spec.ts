import { derivePhaseAndWindow } from '../logic/derive-phases';
import { DetectedPeriod } from '../domain/detected-period';

describe('derivePhaseAndWindow (Module 4)', () => {
  const lastPeriod: DetectedPeriod = {
    startDate: '2025-01-01',
    endDate: '2025-01-05',
    bleedingDaysCount: 4,
    totalSpanDays: 5,
    confidenceFlags: [],
  };

  it('prioritizes menstrual phase when ovulation window overlaps bleeding', () => {
    const result = derivePhaseAndWindow({
      today: '2025-01-04',
      lastPeriod,
      avgCycleLength: 20, // short cycle → ovulation near menses
      confidence: 0.8,
    });

    expect(result.currentPhase).toBe('MENSTRUAL');
    expect(result.flags).toContain('OVERLAP_WITH_MENSES');
    expect(result.ovulationWindow).toBeDefined();
  });

  it('returns ovulation window phase inside probabilistic window', () => {
    const result = derivePhaseAndWindow({
      today: '2025-01-15',
      lastPeriod,
      avgCycleLength: 28,
      confidence: 0.9,
    });

    expect(result.currentPhase).toBe('OVULATION_WINDOW');
    expect(result.explanation).toMatch(/window of higher probability/i);
  });

  it('flags highly irregular cycles and suppresses ovulation window', () => {
    const result = derivePhaseAndWindow({
      today: '2025-01-10',
      lastPeriod,
      avgCycleLength: 18,
      confidence: 0.9,
    });

    expect(result.flags).toContain('HIGHLY_IRREGULAR');
    expect(result.ovulationWindow).toBeUndefined();
    expect(result.explanation).toMatch(/consult/i);
  });

  it('widens ovulation window when confidence is low', () => {
    const result = derivePhaseAndWindow({
      today: '2025-01-14',
      lastPeriod,
      avgCycleLength: 28,
      confidence: 0.3,
    });

    expect(result.ovulationWindow).toBeDefined();

    const { earliest, latest } = result.ovulationWindow!;
    expect(earliest).toBe('2025-01-11'); // center 15 − 4
    expect(latest).toBe('2025-01-19'); // center 15 + 4
  });
});
