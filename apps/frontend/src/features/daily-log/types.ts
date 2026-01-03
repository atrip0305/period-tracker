export type FlowLevel =
  | 'NONE'
  | 'SPOTTING'
  | 'LIGHT'
  | 'MEDIUM'
  | 'HEAVY';

export type DailyLogInput = {
  date: string; // yyyy-mm-dd
  hadPeriod: boolean;
  flow?: FlowLevel;
  notes?: string;
};
