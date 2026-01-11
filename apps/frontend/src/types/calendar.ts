export type CalendarDay = {
  date: string; // YYYY-MM-DD
  isToday: boolean;

  log?: {
    hadPeriod: boolean;
    flow: 'NONE' | 'SPOTTING' | 'LIGHT' | 'MEDIUM' | 'HEAVY';
  };

  phase?: 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATION_WINDOW' | 'LUTEAL';

  prediction?: {
    type: 'PERIOD' | 'OVULATION';
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  };

  flags?: string[];
};
