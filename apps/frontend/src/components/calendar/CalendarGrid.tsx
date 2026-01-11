// apps/frontend/src/components/calendar/CalendarGrid.tsx

import type { CalendarDay } from '../../types/calendar';
import { CalendarCell } from './CalendarCell';

export function CalendarGrid({ days }: { days: CalendarDay[] }) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day) => (
        <CalendarCell key={day.date} day={day} />
      ))}
    </div>
  );
}
