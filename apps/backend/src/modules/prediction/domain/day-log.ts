import { FlowLevel } from './flow-level';

export interface DayLog {
  date: string; // ISO yyyy-mm-dd (local date)
  flowLevel: FlowLevel;
}
