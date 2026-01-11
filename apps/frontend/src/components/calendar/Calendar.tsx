import type { CalendarDay } from '../../types/calendar';
import { CalendarGrid } from './CalendarGrid';

export function Calendar({ days }: { days: CalendarDay[] }) {
  return <CalendarGrid days={days} />;
}
