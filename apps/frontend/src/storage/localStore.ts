import { openDB, type DBSchema } from 'idb';
import type { PeriodLogRecord } from './types';

const DB_NAME = 'period-tracker-db';
const DB_VERSION = 1;

/**
 * IndexedDB schema definition.
 * This is local-only and device-owned.
 */
interface PeriodTrackerDB extends DBSchema {
  periodLogs: {
    key: string; // YYYY-MM-DD
    value: PeriodLogRecord;
  };
}

const dbPromise = openDB<PeriodTrackerDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('periodLogs')) {
      db.createObjectStore('periodLogs');
    }
  },
});

/**
 * Local-only IndexedDB implementation.
 * Never exported directly outside storage/.
 */
export const localStore = {
  async getAllPeriodLogs(): Promise<PeriodLogRecord[]> {
    const db = await dbPromise;
    return db.getAll('periodLogs');
  },
  async clearAll(): Promise<void> {
  const db = await dbPromise;
  await db.clear('periodLogs');
},
  async savePeriodLog(record: PeriodLogRecord): Promise<void> {
    const db = await dbPromise;
    await db.put('periodLogs', record, record.date);
  },

  async deletePeriodLog(date: string): Promise<void> {
    const db = await dbPromise;
    await db.delete('periodLogs', date);
  },
};
