/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import type { DailyLogInput } from './types';

export function useDailyLog() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveLog(input: DailyLogInput) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://192.168.1.9:3000/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      return await res.json();
    } catch (e: any) {
      setError(e.message ?? 'Failed to save log');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { saveLog, loading, error };
}
