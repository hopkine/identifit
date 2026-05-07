/**
 * YYYY-MM-DD in the user's local calendar (not UTC).
 * Use for OOTD day keys so saves align with calendar grids (Memories, Home strip).
 */
export function formatLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Calendar grid helper — same string as `formatLocalDateKey(new Date(y, monthIndex, day))`. */
export function toLocalDateKey(
  year: number,
  monthIndex: number,
  day: number
): string {
  return formatLocalDateKey(new Date(year, monthIndex, day));
}
