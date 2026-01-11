import type { CalendarDay } from '../../types/calendar';

export function CalendarCell({ day }: { day: CalendarDay }) {
  const log = day.log;
  const prediction = day.prediction;

  return (
    <div
      className={`
        relative h-20 rounded border text-xs
        ${
  day.isToday
    ? 'ring-2 ring-rose-300/70 ring-offset-2 ring-offset-[#251f33]'
    : ''
}

      `}
    >
      {/* Date label */}
      <div className="absolute top-1 right-1 text-gray-600">
        {day.date.slice(-2)}
      </div>

      {/* Factual log layer (solid, dark-mode reconciled) */}
{log && log.flow !== 'NONE' && (
  <div
    className={`
      absolute inset-1 rounded
      ${
        log.flow === 'HEAVY'
          ? 'bg-rose-600/90'
          : log.flow === 'MEDIUM'
          ? 'bg-rose-500/85'
          : log.flow === 'LIGHT'
          ? 'bg-rose-400/80'
          : log.flow === 'SPOTTING'
          ? 'bg-rose-900/40'
          : ''
      }
    `}
  />
)}



      {/* Prediction layer (outlined, dark-mode reconciled) */}
{prediction && (
  <div
    title={`Predicted ovulation — ${prediction.confidence.toLowerCase()} confidence`}
    className={`
      absolute inset-1 rounded border
      ${
        prediction.confidence === 'HIGH'
          ? 'border-2 border-purple-400 opacity-80'
          : prediction.confidence === 'MEDIUM'
          ? 'border border-purple-500 opacity-60'
          : 'border border-purple-600 opacity-50 border-dashed'
      }
    `}
  />
)}


      {/* Conflict / warning flags */}
{day.flags && day.flags.length > 0 && (
  <div
    className="absolute top-1 left-1 text-[10px] text-amber-400"
    title="Logged flow differs from prediction"
  >
    ✦
  </div>
)}

    </div>
  );
}
