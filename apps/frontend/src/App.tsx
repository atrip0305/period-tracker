import { Calendar } from './components/calendar/Calendar';
import type { CalendarDay } from './types/calendar';

const mockDays: CalendarDay[] = [
  {
    date: '2025-01-10',
    isToday: false,
    log: { hadPeriod: true, flow: 'HEAVY' },
  },
  {
    date: '2025-01-11',
    isToday: true,
    prediction: { type: 'OVULATION', confidence: 'LOW' },
  },
  {
    date: '2025-01-12',
    isToday: false,
    log: { hadPeriod: true, flow: 'MEDIUM' },
    prediction: { type: 'OVULATION', confidence: 'HIGH' },
    flags: ['OVERLAP_WITH_MENSES'],
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-[#1a1625] text-rose-100/90 p-4">
      <Calendar days={mockDays} />
    </div>
  );
}

