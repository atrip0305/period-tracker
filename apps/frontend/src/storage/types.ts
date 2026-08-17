export type FlowIntensity =
  | 'SPOTTING'
  | 'LIGHT'
  | 'MEDIUM'
  | 'HEAVY';

export interface PeriodLogRecord {
  /**
   * ISO date string (YYYY-MM-DD)
   */
  date: string;

  /**
   * Flow intensity logged by the user.
   */
  flow: FlowIntensity;

  /**
   * Optional user note for the day.
   */
  notes?: string;
}