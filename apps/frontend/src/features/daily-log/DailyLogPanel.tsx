import { useEffect, useState } from 'react';
import type { DailyLogInput, FlowLevel } from './types';
import { useDailyLog } from './useDailyLog';

type Props = {
  date: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  isPastDate?: boolean;
};

const FLOW_OPTIONS: {
  value: FlowLevel;
  label: string;
  description: string;
}[] = [
  {
    value: 'LIGHT',
    label: 'Light',
    description: 'Light flow',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    description: 'Moderate flow',
  },
  {
    value: 'HEAVY',
    label: 'Heavy',
    description: 'Heavy flow',
  },
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

export function DailyLogPanel({
  date,
  isOpen,
  onClose,
  onSaved,
  isPastDate = false,
}: Props) {
  const { saveLog, loading, error } = useDailyLog();

  const [hadPeriod, setHadPeriod] = useState(false);
  const [flow, setFlow] = useState<FlowLevel>('NONE');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setHadPeriod(false);
      setFlow('NONE');
      setNotes('');
    }
  }, [date, isOpen]);

  if (!isOpen) {
    return null;
  }

  async function handleSave() {
    const payload: DailyLogInput = {
      date,
      hadPeriod,
      flow: hadPeriod
        ? flow
        : flow === 'SPOTTING'
          ? 'SPOTTING'
          : 'NONE',
      notes: notes.trim() || undefined,
    };

    try {
      await saveLog(payload);
      onSaved?.();
      onClose();
    } catch {
      // Error is displayed by the hook state.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close daily log"
        onClick={onClose}
        className="absolute inset-0 bg-[#241F2B]/35 backdrop-blur-[2px]"
      />

      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-[-20px_0_60px_rgba(36,31,43,0.16)]">
        {/* Header */}
        <div className="border-b border-[#EEE7F0] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A909E]">
                Daily check-in
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#241F2B]">
                Log your day
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8E1EA] text-[#766D7B] transition hover:bg-[#FBF8FC]"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <p className="mt-4 text-sm font-medium text-[#5F5665]">
            {formatDate(date)}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isPastDate && (
            <div className="mb-6 rounded-2xl border border-[#F2DFC0] bg-[#FFF9ED] p-4">
              <div className="flex gap-3">
                <span className="text-[#C28B32]">⚠</span>

                <div>
                  <p className="text-sm font-semibold text-[#785B27]">
                    Editing a past entry
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#967B4D]">
                    Updating historical data can change your cycle
                    reconstruction and future predictions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Period toggle */}
          <section>
            <p className="text-sm font-semibold text-[#403747]">
              Did you have your period?
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setHadPeriod(true);
                  if (flow === 'NONE' || flow === 'SPOTTING') {
                    setFlow('LIGHT');
                  }
                }}
                className={[
                  'rounded-2xl border px-4 py-4 text-left transition',
                  hadPeriod
                    ? 'border-[#C84870] bg-[#FFF4F7] shadow-sm'
                    : 'border-[#E8E1EA] bg-white hover:bg-[#FCFAFD]',
                ].join(' ')}
              >
                <div
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-xl text-sm',
                    hadPeriod
                      ? 'bg-[#F7DCE5] text-[#B43D62]'
                      : 'bg-[#F6F2F7] text-[#837987]',
                  ].join(' ')}
                >
                  ✓
                </div>

                <p className="mt-3 text-sm font-semibold text-[#403747]">
                  Yes
                </p>

                <p className="mt-1 text-xs text-[#938A97]">
                  Menstrual flow
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setHadPeriod(false);
                  setFlow('NONE');
                }}
                className={[
                  'rounded-2xl border px-4 py-4 text-left transition',
                  !hadPeriod
                    ? 'border-[#C84870] bg-[#FFF4F7] shadow-sm'
                    : 'border-[#E8E1EA] bg-white hover:bg-[#FCFAFD]',
                ].join(' ')}
              >
                <div
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-xl text-sm',
                    !hadPeriod
                      ? 'bg-[#F7DCE5] text-[#B43D62]'
                      : 'bg-[#F6F2F7] text-[#837987]',
                  ].join(' ')}
                >
                  ○
                </div>

                <p className="mt-3 text-sm font-semibold text-[#403747]">
                  No
                </p>

                <p className="mt-1 text-xs text-[#938A97]">
                  No menstrual flow
                </p>
              </button>
            </div>
          </section>

          {/* Flow */}
          <section className="mt-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold text-[#403747]">
                  Flow
                </p>
                <p className="mt-1 text-xs text-[#938A97]">
                  {hadPeriod
                    ? 'Choose the intensity you observed.'
                    : 'Spotting can be recorded separately.'}
                </p>
              </div>
            </div>

            {hadPeriod ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {FLOW_OPTIONS.map((option) => {
                  const selected = flow === option.value;

                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setFlow(option.value)}
                      className={[
                        'rounded-2xl border px-3 py-3 text-center transition',
                        selected
                          ? 'border-[#C84870] bg-[#FFF4F7] text-[#A13B5D]'
                          : 'border-[#E8E1EA] bg-white text-[#6E6573] hover:bg-[#FCFAFD]',
                      ].join(' ')}
                    >
                      <div
                        className={[
                          'mx-auto h-3 w-3 rounded-full',
                          option.value === 'LIGHT'
                            ? 'bg-[#EFA9BF]'
                            : option.value === 'MEDIUM'
                              ? 'bg-[#DD7093]'
                              : 'bg-[#C84870]',
                        ].join(' ')}
                      />

                      <p className="mt-2 text-xs font-semibold">
                        {option.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setFlow('SPOTTING')}
                className={[
                  'mt-3 w-full rounded-2xl border px-4 py-4 text-left transition',
                  flow === 'SPOTTING'
                    ? 'border-[#C84870] bg-[#FFF4F7]'
                    : 'border-[#E8E1EA] hover:bg-[#FCFAFD]',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-[#D4A0B2]" />

                  <div>
                    <p className="text-sm font-semibold text-[#403747]">
                      Spotting
                    </p>

                    <p className="mt-1 text-xs text-[#938A97]">
                      Record spotting without marking it as a period.
                    </p>
                  </div>

                  {flow === 'SPOTTING' && (
                    <span className="ml-auto text-sm text-[#C84870]">
                      ✓
                    </span>
                  )}
                </div>
              </button>
            )}
          </section>

          {/* Notes */}
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#403747]">
                Notes
              </p>

              <span className="text-[11px] text-[#A39AA8]">
                Optional
              </span>
            </div>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Anything you want to remember about today..."
              rows={5}
              className="mt-3 w-full resize-none rounded-2xl border border-[#E8E1EA] bg-[#FCFAFD] p-4 text-sm text-[#403747] outline-none transition placeholder:text-[#B1A9B5] focus:border-[#C84870] focus:bg-white focus:ring-4 focus:ring-[#C84870]/10"
            />
          </section>

          {error && (
            <div className="mt-5 rounded-2xl border border-[#F0C9D4] bg-[#FFF4F7] p-4 text-sm text-[#A13B5D]">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#EEE7F0] bg-white px-6 py-5">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-2xl border border-[#E5DEE8] px-4 py-3 text-sm font-semibold text-[#665E6C] transition hover:bg-[#FCFAFD]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading || (!hadPeriod && flow !== 'SPOTTING')}
              className="flex-[1.5] rounded-2xl bg-[#C84870] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(200,72,112,0.2)] transition hover:bg-[#B53E63] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loading ? 'Saving…' : 'Save entry'}
            </button>
          </div>

          <p className="mt-3 text-center text-[10px] leading-4 text-[#A39AA8]">
            This entry is stored locally on your device.
          </p>
        </div>
      </aside>
    </div>
  );
}