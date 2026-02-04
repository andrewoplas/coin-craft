import { db } from '@/db';
import { achievements, userAchievements } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: string;
};

export type UserAchievement = Achievement & {
  earnedAt: Date;
};

/**
 * Get all achievements available in the system
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  const results = await db
    .select({
      id: achievements.id,
      name: achievements.name,
      description: achievements.description,
      icon: achievements.icon,
      category: achievements.category,
      requirement: achievements.requirement,
    })
    .from(achievements)
    .orderBy(achievements.sortOrder);

  return results;
}

/**
 * Get achievements earned by a user
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const results = await db
    .select({
      id: achievements.id,
      name: achievements.name,
      description: achievements.description,
      icon: achievements.icon,
      category: achievements.category,
      requirement: achievements.requirement,
      earnedAt: userAchievements.earnedAt,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId))
    .orderBy(userAchievements.earnedAt);

  return results;
}

/**
 * Get achievement IDs that a user has already earned
 */
export async function getUserAchievementIds(userId: string): Promise<string[]> {
  const results = await db
    .select({ achievementId: userAchievements.achievementId })
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  return results.map((r) => r.achievementId);
}

/**
 * Check if user has earned a specific achievement
 */
export async function hasAchievement(
  userId: string,
  achievementId: string
): Promise<boolean> {
  const [result] = await db
    .select({ id: userAchievements.id })
    .from(userAchievements)
    .where(
      eq(userAchievements.userId, userId)
    )
    .limit(1);

  if (!result) return false;

  const userAchievementList = await db
    .select({ achievementId: userAchievements.achievementId })
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  return userAchievementList.some((a) => a.achievementId === achievementId);
}

/**
 * Get achievements with their earned status for a user
 */
export async function getAchievementsWithStatus(userId: string): Promise<
  (Achievement & { earned: boolean; earnedAt?: Date })[]
> {
  const allAchievementsList = await getAllAchievements();
  const earnedAchievements = await getUserAchievements(userId);
  const earnedMap = new Map(earnedAchievements.map((a) => [a.id, a.earnedAt]));

  return allAchievementsList.map((achievement) => ({
    ...achievement,
    earned: earnedMap.has(achievement.id),
    earnedAt: earnedMap.get(achievement.id),
  }));
}
