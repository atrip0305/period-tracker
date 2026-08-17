import { useEffect, useMemo, useState } from 'react';
import { DailyLogPanel } from './features/daily-log/DailyLogPanel';
import { storage } from './storage';
import type { PeriodLogRecord } from './storage/types';

type CalendarEntry = {
  date: Date;
  iso: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  flow?: PeriodLogRecord['flow'];
};

const FLOW_STYLES: Record<
  PeriodLogRecord['flow'],
  { label: string; className: string }
> = {
  SPOTTING: {
    label: 'Spotting',
    className: 'bg-[#D7A7B8] text-[#7E334C]',
  },
  LIGHT: {
    label: 'Light',
    className: 'bg-[#EFA9BF] text-[#8E2D4E]',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-[#DD7093] text-white',
  },
  HEAVY: {
    label: 'Heavy',
    className: 'bg-[#C84870] text-white',
  },
};

function toISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function buildCalendar(
  year: number,
  month: number,
  logsByDate: Map<string, PeriodLogRecord>,
): CalendarEntry[] {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const mondayOffset = firstWeekday === 0 ? 6 : firstWeekday - 1;

  const gridStart = new Date(year, month, 1 - mondayOffset);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    const iso = toISO(date);
    const log = logsByDate.get(iso);

    return {
      date,
      iso,
      isCurrentMonth: date.getMonth() === month,
      isToday: normalized.getTime() === today.getTime(),
      flow: log?.flow,
    };
  });
}

function formatMonth(year: number, month: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1));
}

function formatToday(): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

function isPastDate(date: string): boolean {
  const selected = new Date(`${date}T00:00:00`);
  const today = new Date();

  selected.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return selected < today;
}

function App() {
  const now = new Date();

  const [viewDate, setViewDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );

  const [logs, setLogs] = useState<PeriodLogRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLogPanelOpen, setIsLogPanelOpen] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  async function loadPrediction(
  currentLogs: PeriodLogRecord[],
) {
  if (currentLogs.length === 0) {
    setPrediction(null);
    return;
  }

  setPredictionLoading(true);
  setPredictionError(null);

  try {
    const response = await fetch(
      'http://localhost:3000/prediction/analyze',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: currentLogs.map((log) => ({
            date: log.date,
            flow: log.flow,
          })),
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Prediction request failed (${response.status})`,
      );
    }

    const data = await response.json();

    setPrediction(data);
  } catch (error) {
    console.error('Prediction error:', error);

    setPredictionError(
      'Prediction service is currently unavailable.',
    );
  } finally {
    setPredictionLoading(false);
  }
}

  async function loadLogs() {
    setLoadingLogs(true);
    setStorageError(null);

    try {
      const storedLogs = await storage.getAllPeriodLogs();

      const sortedLogs = [...storedLogs].sort((a, b) =>
  a.date.localeCompare(b.date),
);

setLogs(sortedLogs);

void loadPrediction(sortedLogs);
    } catch {
      setStorageError(
        'We could not load your local cycle history.',
      );
    } finally {
      setLoadingLogs(false);
    }
  }

  useEffect(() => {
    void loadLogs();
  }, []);

  const logsByDate = useMemo(
    () => new Map(logs.map((log) => [log.date, log])),
    [logs],
  );

  const calendarDays = useMemo(
    () =>
      buildCalendar(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        logsByDate,
      ),
    [viewDate, logsByDate],
  );

  const selectedLog = selectedDate
    ? logsByDate.get(selectedDate)
    : undefined;

  const periodDays = logs.filter(
    (log) => log.flow !== 'SPOTTING',
  ).length;

  const spottingDays = logs.filter(
    (log) => log.flow === 'SPOTTING',
  ).length;

  function goToPreviousMonth() {
    setViewDate(
      new Date(
        viewDate.getFullYear(),
        viewDate.getMonth() - 1,
        1,
      ),
    );
  }

  function goToNextMonth() {
    setViewDate(
      new Date(
        viewDate.getFullYear(),
        viewDate.getMonth() + 1,
        1,
      ),
    );
  }

  function goToToday() {
    setViewDate(
      new Date(now.getFullYear(), now.getMonth(), 1),
    );
  }

  function handleSelectDate(iso: string) {
    setSelectedDate(iso);
    setIsLogPanelOpen(true);
  }

  function handleLogToday() {
    const today = toISO(new Date());

    setSelectedDate(today);
    setIsLogPanelOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#FAF8FC] text-[#241F2B]">
      {/* Header */}
      <header className="border-b border-[#ECE6EF] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C84870] text-lg text-white shadow-sm">
              ♡
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">
                CycleSync
              </div>

              <div className="text-xs text-[#8A828F]">
                Your cycle, understood with uncertainty.
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[#E7E0EA] bg-[#FCFAFD] px-4 py-2 text-xs font-medium text-[#665E6C] sm:flex">
            <span className="text-[#5B9477]">●</span>
            Your data stays on this device
          </div>

          <button
            type="button"
            className="rounded-xl border border-[#E7E0EA] bg-white px-3 py-2 text-sm font-medium text-[#665E6C] transition hover:border-[#D4C9D8] hover:bg-[#FCFAFD]"
            aria-label="More options"
          >
            ⋯
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 py-7 sm:px-8 lg:py-10">
        {/* Hero */}
        <section className="mb-8">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#C84870]">
              {formatToday()}
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Understand your cycle.
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-[#756D7B]">
              CycleSync turns your daily observations into cycle
              insights while keeping uncertainty visible instead of
              pretending predictions are exact.
            </p>
          </div>
        </section>

        {/* Storage status */}
        {storageError && (
          <div className="mb-6 rounded-2xl border border-[#F0C9D4] bg-[#FFF4F7] px-4 py-3 text-sm text-[#A13B5D]">
            {storageError}
          </div>
        )}
        {predictionError && (
  <div className="mb-6 rounded-2xl border border-[#F0C9D4] bg-[#FFF4F7] px-4 py-3 text-sm text-[#A13B5D]">
    {predictionError}
  </div>
)}
        {/* Primary cards */}
        <section className="mb-6 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <article className="relative overflow-hidden rounded-[28px] bg-[#241F2B] p-6 text-white shadow-[0_18px_50px_rgba(36,31,43,0.14)] sm:p-8">
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#C84870]/20 blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                    Next period
                  </p>

                  <h2 className="mt-3 text-3xl font-bold tracking-tight">
  {predictionLoading
    ? 'Analyzing your cycle…'
    : prediction?.prediction
      ? formatPredictionDate(
          prediction.prediction.nextPeriodWindow.expected,
        )
      : logs.length === 0
        ? 'Build your history'
        : 'More history needed'}
</h2>

                  <p className="mt-2 max-w-lg text-sm leading-6 text-white/60">
  {predictionLoading
    ? 'Your recorded observations are being analyzed using CycleSync’s uncertainty-aware prediction engine.'
    : prediction?.prediction
      ? `Possible window: ${formatPredictionDate(
          prediction.prediction.nextPeriodWindow.earliest,
        )} – ${formatPredictionDate(
          prediction.prediction.nextPeriodWindow.latest,
        )}.`
      : logs.length === 0
        ? 'Add your actual period days so CycleSync can reconstruct your cycle history.'
        : 'At least two detected periods are needed before a cycle length can be calculated.'}
</p>
                </div>

                <div className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-medium text-white/75">
  {prediction?.prediction
    ? `${Math.round(
        prediction.prediction.confidence * 100,
      )}% confidence`
    : logs.length === 0
      ? 'Collecting history'
      : 'Building history'}
</div>
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">
                    Observations stored
                  </span>

                  <span className="text-sm font-semibold text-white/80">
                    {loadingLogs ? '…' : logs.length}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#D96C90] transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(8, logs.length * 8),
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs leading-5 text-white/45">
                  Every saved observation stays in this browser's
                  local IndexedDB storage.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-[#E9E1EB] bg-white p-6 shadow-[0_12px_35px_rgba(54,42,62,0.06)] sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A909E]">
                  Current phase
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight">
  {predictionLoading
    ? 'Analyzing…'
    : prediction?.phase?.currentPhase
      ? formatPhase(prediction.phase.currentPhase)
      : 'Waiting for your history'}
</h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8EAF0] text-xl">
                ◌
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-[#FBF8FC] p-4">
              <p className="text-sm font-medium text-[#5F5665]">
                {logs.length < 2
                  ? 'Start by logging your actual flow.'
                  : 'Your history can now be analyzed.'}
              </p>

              <p className="mt-2 text-sm leading-6 text-[#8A828F]">
  {prediction?.phase?.explanation ??
    'CycleSync will distinguish observed menstrual data from spotting and inferred cycle phases.'}
</p>
            </div>
          </article>
        </section>

        {/* Stats */}
        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Logged days"
            value={loadingLogs ? '…' : String(logs.length)}
            detail="observations"
          />

          <StatCard
            label="Period days"
            value={loadingLogs ? '…' : String(periodDays)}
            detail="flow days"
          />

          <StatCard
            label="Spotting"
            value={loadingLogs ? '…' : String(spottingDays)}
            detail="days"
          />

          <StatCard
  label="Avg cycle"
  value={
    prediction?.prediction
      ? `${prediction.prediction.averageCycleLength}`
      : '—'
  }
  detail="days"
/>
        </section>

        {/* Calendar + daily action */}
        <section className="grid gap-6 xl:grid-cols-[1.7fr_0.8fr]">
          <article className="rounded-[28px] border border-[#E9E1EB] bg-white p-5 shadow-[0_12px_35px_rgba(54,42,62,0.06)] sm:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A909E]">
                  Calendar
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  {formatMonth(
                    viewDate.getFullYear(),
                    viewDate.getMonth(),
                  )}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToToday}
                  className="hidden rounded-xl border border-[#E7E0EA] px-3 py-2 text-xs font-semibold text-[#665E6C] transition hover:bg-[#FCFAFD] sm:block"
                >
                  Today
                </button>

                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E7E0EA] text-[#665E6C] transition hover:bg-[#FCFAFD]"
                  aria-label="Previous month"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E7E0EA] text-[#665E6C] transition hover:bg-[#FCFAFD]"
                  aria-label="Next month"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="mb-2 grid grid-cols-7">
              {[
                'Mon',
                'Tue',
                'Wed',
                'Thu',
                'Fri',
                'Sat',
                'Sun',
              ].map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-[#A39AA8]"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarDays.map((day) => {
                const selected = selectedDate === day.iso;
                const flowStyle = day.flow
                  ? FLOW_STYLES[day.flow]
                  : undefined;

                return (
                  <button
                    type="button"
                    key={day.iso}
                    onClick={() => handleSelectDate(day.iso)}
                    className={[
                      'relative min-h-[72px] rounded-2xl border p-2 text-left transition sm:min-h-[84px]',
                      day.isCurrentMonth
                        ? 'border-[#EEE7F0] bg-white hover:border-[#DCCFD9] hover:bg-[#FCFAFD]'
                        : 'border-transparent bg-[#FBF9FC]',
                      day.isToday
                        ? 'ring-2 ring-[#C84870]/25 ring-offset-1'
                        : '',
                      selected
                        ? 'border-[#C84870] bg-[#FFF7FA] shadow-sm'
                        : '',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={[
                          'text-xs font-semibold',
                          day.isToday
                            ? 'text-[#C84870]'
                            : day.isCurrentMonth
                              ? 'text-[#625968]'
                              : 'text-[#C7C0C9]',
                        ].join(' ')}
                      >
                        {day.date.getDate()}
                      </span>

                      {day.isToday && (
                        <span className="hidden rounded-full bg-[#F8E4EB] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#B33B60] sm:block">
                          Today
                        </span>
                      )}
                    </div>

                    {flowStyle ? (
                      <div className="mt-3">
                        <span
                          className={`inline-flex max-w-full rounded-full px-2 py-1 text-[9px] font-semibold ${flowStyle.className}`}
                        >
                          {flowStyle.label}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-4 text-[10px] text-[#C5BDC7]">
                        —
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#F0EBF1] pt-5">
              <LegendDot
                className="bg-[#DD7093]"
                label="Observed flow"
              />

              <LegendDot
                className="bg-[#D7A7B8]"
                label="Spotting"
              />

              <LegendDot
                className="border-2 border-[#C84870] bg-transparent"
                label="Today"
              />
            </div>
          </article>

          {/* Daily action */}
          <aside className="rounded-[28px] border border-[#E9E1EB] bg-white p-6 shadow-[0_12px_35px_rgba(54,42,62,0.06)] sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A909E]">
              Daily check-in
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              How was today?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#857C89]">
              Record what you actually observed. Predictions will be
              kept separate from these facts.
            </p>

            <div className="mt-7 rounded-2xl bg-[#FBF8FC] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8E4EB] text-[#C84870]">
                  +
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#403747]">
                    {selectedDate
                      ? `Selected ${selectedDate}`
                      : 'Choose a date'}
                  </p>

                  <p className="text-xs text-[#938A97]">
                    Flow, spotting and notes
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogToday}
              className="mt-5 w-full rounded-2xl bg-[#C84870] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(200,72,112,0.22)] transition hover:bg-[#B53E63] active:scale-[0.99]"
            >
              Log today
            </button>

            <div className="mt-5 rounded-2xl border border-[#EEE7F0] p-4">
              <p className="text-xs font-semibold text-[#5E5564]">
                Privacy first
              </p>

              <p className="mt-1 text-xs leading-5 text-[#948B98]">
                Your cycle observations are stored locally in this
                browser. No account or background sync is required.
              </p>
            </div>
          </aside>
        </section>
{prediction?.prediction && (
  <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
    <article className="rounded-[28px] border border-[#E9E1EB] bg-white p-6 shadow-[0_12px_35px_rgba(54,42,62,0.06)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A909E]">
            Prediction window
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Your next period
          </h2>
        </div>

        <div className="rounded-full bg-[#F8EAF0] px-3 py-1.5 text-xs font-semibold text-[#A13B5D]">
          {Math.round(
            prediction.prediction.confidence * 100,
          )}
          % confidence
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <PredictionDateCard
          label="Earliest"
          date={
            prediction.prediction.nextPeriodWindow.earliest
          }
        />

        <PredictionDateCard
          label="Expected"
          date={
            prediction.prediction.nextPeriodWindow.expected
          }
          featured
        />

        <PredictionDateCard
          label="Latest"
          date={
            prediction.prediction.nextPeriodWindow.latest
          }
        />
      </div>

      <div className="mt-6 rounded-2xl bg-[#FBF8FC] p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#766D7B]">
            Observed cycle variability
          </span>

          <span className="font-semibold text-[#403747]">
            ±{prediction.prediction.variabilityDays} day
            {prediction.prediction.variabilityDays === 1
              ? ''
              : 's'}
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEE8F0]">
          <div
            className="h-full rounded-full bg-[#C84870]"
            style={{
              width: `${Math.max(
                12,
                Math.min(
                  100,
                  prediction.prediction.confidence * 100,
                ),
              )}%`,
            }}
          />
        </div>

        <p className="mt-3 text-xs leading-5 text-[#958C99]">
          The window expands when your historical cycle lengths
          vary more. This is an estimate, not a guaranteed date.
        </p>
      </div>
    </article>

    <article className="rounded-[28px] border border-[#E9E1EB] bg-white p-6 shadow-[0_12px_35px_rgba(54,42,62,0.06)] sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A909E]">
        Phase insight
      </p>

      <h2 className="mt-2 text-2xl font-bold tracking-tight">
        {formatPhase(
          prediction.phase?.currentPhase ?? 'UNKNOWN',
        )}
      </h2>

      <p className="mt-4 text-sm leading-6 text-[#766D7B]">
        {prediction.phase?.explanation ??
          'No phase estimate is currently available.'}
      </p>

      {prediction.phase?.ovulationWindow && (
        <div className="mt-6 rounded-2xl border border-[#EDE5F0] bg-[#FCFAFD] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9A909E]">
            Estimated ovulation window
          </p>

          <p className="mt-2 text-base font-bold text-[#403747]">
            {formatPredictionDate(
              prediction.phase.ovulationWindow.earliest,
            )}{' '}
            –{' '}
            {formatPredictionDate(
              prediction.phase.ovulationWindow.latest,
            )}
          </p>

          <p className="mt-2 text-xs text-[#958C99]">
            Window confidence:{' '}
            {Math.round(
              prediction.phase.ovulationWindow.confidence * 100,
            )}
            %
          </p>
        </div>
      )}

      {prediction.phase?.flags?.length > 0 && (
        <div className="mt-5 rounded-2xl border border-[#F2DFC0] bg-[#FFF9ED] p-4">
          <p className="text-xs font-semibold text-[#785B27]">
            Attention
          </p>

          <p className="mt-1 text-xs leading-5 text-[#967B4D]">
            {prediction.phase.flags.join(' · ')}
          </p>
        </div>
      )}
    </article>
  </section>
)}
        {/* Insights */}
        <section className="mt-6 rounded-[28px] border border-[#E9E1EB] bg-white p-6 shadow-[0_12px_35px_rgba(54,42,62,0.06)] sm:p-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A909E]">
                Cycle insights
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                {logs.length === 0
                  ? 'Your history starts here.'
                  : `${logs.length} observation${logs.length === 1 ? '' : 's'} recorded.`}
              </h2>
            </div>

            <span className="w-fit rounded-full bg-[#F8EAF0] px-3 py-1.5 text-xs font-semibold text-[#A13B5D]">
              Local history
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <InsightCard
              number="01"
              title="Observed data"
              description="Solid flow entries on the calendar represent something you actually logged."
            />

            <InsightCard
              number="02"
              title="Build a cycle history"
              description="Once multiple periods are recorded, the backend can reconstruct cycle lengths and variability."
            />

            <InsightCard
              number="03"
              title="Predictions come later"
              description="Future estimates will be shown separately with confidence and uncertainty instead of as guaranteed dates."
            />
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-[#9A919E]">
          CycleSync · Privacy-conscious cycle tracking · Educational software
        </footer>
      </main>

      {/* Daily logging drawer */}
      {selectedDate && (
        <DailyLogPanel
          date={selectedDate}
          isOpen={isLogPanelOpen}
          isPastDate={isPastDate(selectedDate)}
          onClose={() => setIsLogPanelOpen(false)}
          onSaved={() => {
            void loadLogs();
          }}
        />
      )}

      {/* Existing log indicator */}
      {selectedLog && !isLogPanelOpen && (
        <div className="fixed bottom-5 right-5 z-40 rounded-2xl border border-[#E8E1EA] bg-white px-4 py-3 text-xs shadow-[0_12px_35px_rgba(54,42,62,0.12)]">
          <span className="font-semibold text-[#403747]">
            {selectedDate}
          </span>{' '}
          <span className="text-[#8C8391]">
            · {FLOW_STYLES[selectedLog.flow].label}
          </span>
        </div>
      )}
    </div>
  );
}
function formatPredictionDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

function formatPhase(phase: string): string {
  switch (phase) {
    case 'MENSTRUAL':
      return 'Menstrual phase';

    case 'FOLLICULAR':
      return 'Follicular phase';

    case 'OVULATION_WINDOW':
      return 'Ovulation window';

    case 'LUTEAL':
      return 'Luteal phase';

    default:
      return phase;
  }
}
function PredictionDateCard({
  label,
  date,
  featured = false,
}: {
  label: string;
  date: string;
  featured?: boolean;
}) {
  return (
    <div
      className={[
        'rounded-2xl border p-4',
        featured
          ? 'border-[#C84870] bg-[#FFF5F8]'
          : 'border-[#EDE7EF] bg-[#FCFAFD]',
      ].join(' ')}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[#9A909E]">
        {label}
      </p>

      <p
        className={[
          'mt-2 text-lg font-bold',
          featured ? 'text-[#B13D61]' : 'text-[#403747]',
        ].join(' ')}
      >
        {formatPredictionDate(date)}
      </p>
    </div>
  );
}
function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-[22px] border border-[#E9E1EB] bg-white p-5 shadow-[0_8px_25px_rgba(54,42,62,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#9A909E]">
        {label}
      </p>

      <div className="mt-3 flex items-end gap-2">
        <span className="text-2xl font-bold tracking-tight text-[#2C2631]">
          {value}
        </span>

        <span className="pb-0.5 text-xs text-[#9A919E]">
          {detail}
        </span>
      </div>
    </article>
  );
}

function LegendDot({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-[#776E7D]">
      <span className={`h-3 w-3 rounded-full ${className}`} />
      {label}
    </div>
  );
}

function InsightCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl bg-[#FBF8FC] p-5">
      <span className="text-xs font-bold tracking-widest text-[#C84870]">
        {number}
      </span>

      <h3 className="mt-3 font-semibold text-[#3D3542]">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-[#857C89]">
        {description}
      </p>
    </article>
  );
}

export default App;