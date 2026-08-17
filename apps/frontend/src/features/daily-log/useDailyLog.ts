import { useState } from 'react';
import type { DailyLogInput } from './types';
import { storage } from '../../storage';

export function useDailyLog() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveLog(input: DailyLogInput) {
    setLoading(true);
    setError(null);

    try {
      const flow =
        input.flow && input.flow !== 'NONE'
          ? input.flow
          : null;

      if (!flow) {
        throw new Error(
          'There is no period or spotting entry to save for this date.',
        );
      }

      await storage.savePeriodLog({
        date: input.date,
        flow,
        notes: input.notes,
      });

      return {
        date: input.date,
        flow,
        notes: input.notes,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to save your log.';

      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return {
    saveLog,
    loading,
    error,
  };
}