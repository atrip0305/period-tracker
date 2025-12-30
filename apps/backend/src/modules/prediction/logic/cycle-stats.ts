import { DetectedCycle } from '../domain/detected-cycle';

export function computeCycleStats(cycles: DetectedCycle[]) {
  if (cycles.length === 0) return null;

  const recentCycles = cycles.slice(-6);
  // eslint-disable-next-line prettier/prettier
  const lengths = recentCycles.map(c => c.lengthDays);

  const avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);

  // eslint-disable-next-line prettier/prettier
  const variability =
    Math.round(
    lengths.reduce((sum, len) => sum + Math.abs(len - avg), 0) / lengths.length,
  );

  let confidence = 1.0;

  if (lengths.length < 3) confidence -= 0.25;
  if (lengths.length < 2) confidence -= 0.4;
  if (variability >= 5) confidence -= 0.25;
  if (variability >= 8) confidence -= 0.4;

  confidence = Math.max(0.2, Number(confidence.toFixed(2)));

  return {
    averageCycleLength: avg,
    variabilityDays: variability,
    confidence,
  };
}
