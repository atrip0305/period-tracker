export function daysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const msPerDay = 1000 * 60 * 60 * 24;

  return Math.round((endDate.getTime() - startDate.getTime()) / msPerDay);
}

export function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
