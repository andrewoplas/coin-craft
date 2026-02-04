import { db } from '@/db';
import { streaks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null;
};

/**
 * Get the streak data for a user
 */
export async function getStreak(userId: string): Promise<StreakData> {
  const [streak] = await db
    .select({
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      lastLogDate: streaks.lastLogDate,
    })
    .from(streaks)
    .where(eq(streaks.userId, userId))
    .limit(1);

  if (!streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: null,
    };
  }

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastLogDate: streak.lastLogDate,
  };
}

/**
 * Get streak milestones that the user has achieved
 */
export function getStreakMilestones(currentStreak: number): {
  milestone7: boolean;
  milestone30: boolean;
  milestone100: boolean;
} {
  return {
    milestone7: currentStreak >= 7,
    milestone30: currentStreak >= 30,
    milestone100: currentStreak >= 100,
  };
}
