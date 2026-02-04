'use server';

import { db } from '@/db';
import { streaks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type UpdateStreakResult = {
  success: boolean;
  currentStreak: number;
  longestStreak: number;
  isNewMilestone?: number; // 7, 30, or 100 if just reached
};

/**
 * Update streak based on a transaction being logged on a given date.
 *
 * Logic:
 * - If lastLogDate is yesterday, increment streak
 * - If lastLogDate is today, no change
 * - If lastLogDate is older or null, reset streak to 1
 * - Update longestStreak if currentStreak exceeds it
 *
 * Returns whether a new milestone (7, 30, 100) was just reached
 */
export async function updateStreak(
  userId: string,
  transactionDate: string
): Promise<UpdateStreakResult> {
  // Get existing streak record
  const [existingStreak] = await db
    .select()
    .from(streaks)
    .where(eq(streaks.userId, userId))
    .limit(1);

  const today = new Date(transactionDate);
  const todayString = transactionDate;

  if (!existingStreak) {
    // Create new streak record
    await db.insert(streaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastLogDate: todayString,
    });
    return {
      success: true,
      currentStreak: 1,
      longestStreak: 1,
    };
  }

  // Check if already logged today
  if (existingStreak.lastLogDate === todayString) {
    return {
      success: true,
      currentStreak: existingStreak.currentStreak,
      longestStreak: existingStreak.longestStreak,
    };
  }

  // Calculate streak
  let newCurrentStreak = existingStreak.currentStreak;
  const oldStreak = existingStreak.currentStreak;

  if (existingStreak.lastLogDate) {
    const lastLog = new Date(existingStreak.lastLogDate);
    const daysDiff = Math.floor(
      (today.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      // Logged yesterday, increment streak
      newCurrentStreak = existingStreak.currentStreak + 1;
    } else if (daysDiff > 1) {
      // Streak broken, reset to 1
      newCurrentStreak = 1;
    }
    // daysDiff === 0 shouldn't happen (already handled above)
  } else {
    // First log ever
    newCurrentStreak = 1;
  }

  // Update longest streak if necessary
  const newLongestStreak = Math.max(newCurrentStreak, existingStreak.longestStreak);

  // Update streak record
  await db
    .update(streaks)
    .set({
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastLogDate: todayString,
      updatedAt: new Date(),
    })
    .where(eq(streaks.userId, userId));

  // Check if we just hit a new milestone
  const milestones = [7, 30, 100];
  let isNewMilestone: number | undefined;
  for (const milestone of milestones) {
    if (newCurrentStreak >= milestone && oldStreak < milestone) {
      isNewMilestone = milestone;
      break; // Return the highest newly reached milestone
    }
  }
  // Actually we want the highest newly reached, so reverse
  for (const milestone of milestones.reverse()) {
    if (newCurrentStreak >= milestone && oldStreak < milestone) {
      isNewMilestone = milestone;
      break;
    }
  }

  return {
    success: true,
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    isNewMilestone,
  };
}
