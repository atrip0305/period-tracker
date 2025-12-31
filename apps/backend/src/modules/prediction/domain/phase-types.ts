export type CyclePhase =
  | 'MENSTRUAL'
  | 'FOLLICULAR'
  | 'OVULATION_WINDOW'
  | 'LUTEAL';

export type PhaseFlag =
  | 'OVERLAP_WITH_MENSES'
  | 'LOW_CONFIDENCE'
  | 'HIGHLY_IRREGULAR';

export interface OvulationWindow {
  earliest: string;
  latest: string;
  confidence: number;
}

export interface PhaseResult {
  currentPhase: CyclePhase;
  ovulationWindow?: OvulationWindow;
  flags: PhaseFlag[];
  explanation: string;
}
