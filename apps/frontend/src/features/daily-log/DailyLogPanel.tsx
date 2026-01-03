import { useState } from 'react';
import type { DailyLogInput } from './types';
import type { FlowLevel } from './types';
import { useDailyLog } from './useDailyLog';

type Props = {
  date: string; // yyyy-mm-dd
  isOpen: boolean;
  onClose: () => void;
  isPastDate?: boolean;
};

export function DailyLogPanel({
  date,
  isOpen,
  onClose,
  isPastDate = false,
}: Props) {
  const { saveLog, loading, error } = useDailyLog();

  const [hadPeriod, setHadPeriod] = useState(false);
  const [flow, setFlow] = useState<FlowLevel>('NONE');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  async function handleSave() {
    const payload: DailyLogInput = {
      date,
      hadPeriod,
      flow: hadPeriod ? flow : flow === 'SPOTTING' ? 'SPOTTING' : 'NONE',
      notes: notes || undefined,
    };

    await saveLog(payload);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          Log for {date}
        </h2>

        {isPastDate && (
          <div className="mb-4 text-sm text-amber-700 bg-amber-100 p-2 rounded">
            Editing past entries will update predictions.
          </div>
        )}

        {/* Period Toggle */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hadPeriod}
              onChange={e => {
                setHadPeriod(e.target.checked);
                if (!e.target.checked) setFlow('NONE');
              }}
            />
            Had period today
          </label>
        </div>

        {/* Flow Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Flow
          </label>

          {hadPeriod ? (
            <select
              value={flow}
              onChange={e => setFlow(e.target.value as FlowLevel)}
              className="border rounded w-full p-2"
            >
              <option value="LIGHT">Light</option>
              <option value="MEDIUM">Medium</option>
              <option value="HEAVY">Heavy</option>
            </select>
          ) : (
            <select
              value={flow}
              onChange={e => setFlow(e.target.value as FlowLevel)}
              className="border rounded w-full p-2"
            >
              <option value="NONE">None</option>
              <option value="SPOTTING">Spotting</option>
            </select>
          )}
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="border rounded w-full p-2"
            rows={3}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 mb-2">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-black text-white text-sm rounded"
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
