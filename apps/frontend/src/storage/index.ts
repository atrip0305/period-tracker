/**
 * Local-only storage interface.
 *
 * This module defines the ONLY allowed
 * access point for user data persistence.
 *
 * There is no network, no sync, no cloud.
 */

import type { PeriodLogRecord } from './types';
import { localStore } from './localStore';

function withStorageSafety<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  return operation().catch((error) => {
    console.error('[Storage Error]', error);
    return fallback;
  });
}


export interface LocalStorageAPI {
  /**
   * Retrieve all stored period logs.
   */
  getAllPeriodLogs(): Promise<PeriodLogRecord[]>;

  /**
   * Persist or overwrite a period log for a date.
   */
  savePeriodLog(record: PeriodLogRecord): Promise<void>;

  /**
   * Remove a period log for a given date.
   */
  deletePeriodLog(date: string): Promise<void>;
  clearAll(): Promise<void>;
}


/**
 * Concrete local-only storage implementation.
 *
 * This is the ONLY exported instance.
 * The underlying IndexedDB details remain private.
 */
export const storage: LocalStorageAPI = {
  getAllPeriodLogs() {
    return withStorageSafety(
      () => localStore.getAllPeriodLogs(),
      []
    );
  },

  savePeriodLog(record) {
    return withStorageSafety(
      () => localStore.savePeriodLog(record),
      undefined
    );
  },

  deletePeriodLog(date) {
    return withStorageSafety(
      () => localStore.deletePeriodLog(date),
      undefined
    );
  },
  clearAll() {
  return withStorageSafety(
    () => localStore.clearAll(),
    undefined
  );
},
};



