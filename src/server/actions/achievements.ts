'use server';

import { db } from '@/db';
import { userAchievements, transactions, allocations, userModules } from '@/db/schema';
import { eq, and, sql, gte, lte } from 'drizzle-orm';
import { getUserAchievementIds } from '@/server/queries/achievements';
import { getStreak } from '@/server/queries/streaks';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export type AchievementContext = {
  transactionCount: number;
  streakCount: number;
  goalsCompleted: number;
  modulesEnabled: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  lastMonthExpenses: number;
  allEnvelopesUnderBudget: boolean;
};

export type AwardedAchievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

/**
 * Check and award achievements for a user based on their current state.
 * Returns newly awarded achievements.
 */
export async function checkAndAwardAchievements(
  userId: string
): Promise<AwardedAchievement[]> {
  // Get already earned achievements
  const earnedIds = await getUserAchievementIds(userId);
  const earnedSet = new Set(earnedIds);

  // Gather data
  const data = await gatherAchievementData(userId);

  const newAchievements: AwardedAchievement[] = [];

  // Check each achievement condition
  const achievementChecks: {
    id: string;
    name: string;
    description: string;
    icon: string;
    check: () => boolean;
  }[] = [
    {
      id: 'first-steps',
      name: 'First Steps',
      description: 'Log your first transaction',
      icon: '🎯',
      check: () => data.transactionCount >= 1,
    },
    {
      id: 'consistency',
      name: 'Consistency',
      description: 'Keep a 7-day logging streak',
      icon: '🔥',
      check: () => data.streakCount >= 7,
    },
    {
      id: 'habit-formed',
      name: 'Habit Formed',
      description: 'Keep a 30-day logging streak',
      icon: '⭐',
      check: () => data.streakCount >= 30,
    },
    {
      id: 'legendary',
      name: 'Legendary',
      description: 'Keep a 100-day logging streak',
      icon: '👑',
      check: () => data.streakCount >= 100,
    },
    {
      id: 'goal-getter',
      name: 'Goal Getter',
      description: 'Complete your first savings goal',
      icon: '🎯',
      check: () => data.goalsCompleted >= 1,
    },
    {
      id: 'category-king',
      name: 'Category King',
      description: 'Categorize 100 transactions',
      icon: '📊',
      check: () => data.transactionCount >= 100,
    },
    {
      id: 'multi-crafter',
      name: 'Multi-Crafter',
      description: 'Enable 3 or more modules',
      icon: '🎨',
      check: () => data.modulesEnabled >= 3,
    },
    {
      id: 'penny-pincher',
      name: 'Penny Pincher',
      description: 'Spend less than last month',
      icon: '💰',
      check: () =>
        data.lastMonthExpenses > 0 && data.monthlyExpenses < data.lastMonthExpenses,
    },
    {
      id: 'big-saver',
      name: 'Big Saver',
      description: 'Save more than 20% of income in a month',
      icon: '💎',
      check: () => {
        if (data.monthlyIncome <= 0) return false;
        const savings = data.monthlyIncome - data.monthlyExpenses;
        const savingsRate = savings / data.monthlyIncome;
        return savingsRate >= 0.2;
      },
    },
    {
      id: 'budget-keeper',
      name: 'Budget Keeper',
      description: 'Stay within all envelopes for a full month',
      icon: '📋',
      check: () => data.allEnvelopesUnderBudget === true,
    },
  ];

  // Check each achievement
  for (const achievement of achievementChecks) {
    if (!earnedSet.has(achievement.id) && achievement.check()) {
      // Award the achievement
      await db.insert(userAchievements).values({
        userId,
        achievementId: achievement.id,
      });

      newAchievements.push({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
      });
    }
  }

  return newAchievements;
}

/**
 * Gather data needed for achievement checking
 */
async function gatherAchievementData(userId: string): Promise<AchievementContext> {
  // Get streak data
  const streak = await getStreak(userId);

  // Get transaction count
  const [txCountResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(transactions)
    .where(eq(transactions.userId, userId));
  const transactionCount = txCountResult?.count || 0;

  // Get completed goals count
  const [goalsResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(allocations)
    .where(
      and(
        eq(allocations.userId, userId),
        eq(allocations.moduleType, 'goals'),
        eq(allocations.isActive, false) // completed goals are marked inactive
      )
    );
  const goalsCompleted = goalsResult?.count || 0;

  // Get enabled modules count
  const [modulesResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userModules)
    .where(and(eq(userModules.userId, userId), eq(userModules.isActive, true)));
  const modulesEnabled = modulesResult?.count || 0;

  // Get current month income and expenses
  const now = new Date();
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

  const [incomeResult] = await db
    .select({ total: sql<number>`coalesce(sum(amount), 0)::int` })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'income'),
        gte(transactions.date, monthStart),
        lte(transactions.date, monthEnd)
      )
    );
  const monthlyIncome = incomeResult?.total || 0;

  const [expenseResult] = await db
    .select({ total: sql<number>`coalesce(sum(amount), 0)::int` })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, monthStart),
        lte(transactions.date, monthEnd)
      )
    );
  const monthlyExpenses = expenseResult?.total || 0;

  // Get last month expenses
  const lastMonth = subMonths(now, 1);
  const lastMonthStart = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
  const lastMonthEnd = format(endOfMonth(lastMonth), 'yyyy-MM-dd');

  const [lastExpenseResult] = await db
    .select({ total: sql<number>`coalesce(sum(amount), 0)::int` })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, lastMonthStart),
        lte(transactions.date, lastMonthEnd)
      )
    );
  const lastMonthExpenses = lastExpenseResult?.total || 0;

  // Check if all envelopes are under budget
  const envelopes = await db
    .select({
      currentAmount: allocations.currentAmount,
      targetAmount: allocations.targetAmount,
    })
    .from(allocations)
    .where(
      and(
        eq(allocations.userId, userId),
        eq(allocations.moduleType, 'envelope'),
        eq(allocations.isActive, true)
      )
    );

  const allEnvelopesUnderBudget =
    envelopes.length > 0 &&
    envelopes.every((e) => e.currentAmount <= (e.targetAmount || 0));

  return {
    transactionCount,
    streakCount: streak.currentStreak,
    goalsCompleted,
    modulesEnabled,
    monthlyIncome,
    monthlyExpenses,
    lastMonthExpenses,
    allEnvelopesUnderBudget,
  };
}
