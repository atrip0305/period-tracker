/**
 * User-owned data models.
 *
 * These types define WHAT data exists,
 * not HOW or WHERE it is stored.
 *
 * All data defined here is:
 * - Local-only
 * - Device-owned
 * - Never transmitted
 */

/**
 * DATA LIFECYCLE NOTES
 *
 * - Records are keyed by date (YYYY-MM-DD)
 * - Writing a record for a date overwrites any existing record
 * - Absence of a record means "no user input"
 * - Deletion is explicit and user-initiated
 * - There is no implicit history or versioning
 */


export type FlowIntensity =
  | 'SPOTTING'
  | 'LIGHT'
  | 'MEDIUM'
  | 'HEAVY';

export interface PeriodLogRecord {
  /**
   * ISO date string (YYYY-MM-DD)
   * Represents the calendar day the user logged.
   */
  date: string;

  /**
   * Flow intensity logged by the user.
   * Absence of a record means "no log",
   * not "no period".
   */
  flow: FlowIntensity;
}
