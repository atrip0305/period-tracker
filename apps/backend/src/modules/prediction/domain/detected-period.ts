export type PeriodConfidenceFlag =
  | 'HAS_MISSING_DAYS'
  | 'FORCED_CLOSED_BY_GAP_CAP';

export interface DetectedPeriod {
  startDate: string;
  endDate: string;
  bleedingDaysCount: number;
  totalSpanDays: number;
  confidenceFlags: PeriodConfidenceFlag[];
}
