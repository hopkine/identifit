import type { OOTD } from '@/types/ootd';

/**
 * Consecutive calendar days (from today, or yesterday if today is empty)
 * on which the user has at least one OOTD recorded.
 */
export function calculateOOTDStreak(userOOTDs: OOTD[]): number {
  if (userOOTDs.length === 0) return 0;

  const sortedOOTDs = [...userOOTDs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateString = currentDate.toISOString().split('T')[0];
    const hasOOTDForDate = sortedOOTDs.some((ootd) => ootd.date === dateString);

    if (hasOOTDForDate) {
      streak++;
    } else {
      if (streak === 0 && i === 0) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      break;
    }

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}
