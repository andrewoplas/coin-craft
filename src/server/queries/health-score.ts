import { db } from '@/db';
import { transactions, allocations, userModules } from '@/db/schema';
import { eq, and, sql, gte, lte } from 'drizzle-orm';
import { getStreak } from './streaks';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export type HealthScoreBreakdown = {
  // Base factors (0-40 points total when no modules, proportionally more when modules active)
  spendingUnderIncome: number; // 0-15
  consistentLogging: number; // 0-15
  spendingTrend: number; // 0-10

  // Module factors (only counted if module is active)
  envelopeAdherence?: number; // 0-20
  envelopeUtilization?: number; // 0-10
  goalContributions?: number; // 0-20
  goalOnTrack?: number; // 0-10

  // Totals
  baseScore: number;
  moduleScore: number;
  totalScore: number;

  // Description for UI
  level: 'poor' | 'fair' | 'good' | 'excellent';
  message: string;
};

/**
 * Calculate financial health score (0-100) based on user's financial habits.
 * Score is weighted based on active modules.
 */
export async function calculateHealthScore(userId: string): Promise<HealthScoreBreakdown> {
  // Get active modules for this user
  const activeModules = await db
    .select({ moduleId: userModules.moduleId })
    .from(userModules)
    .where(and(eq(userModules.userId, userId), eq(userModules.isActive, true)));

  const hasEnvelopeModule = activeModules.some((m) => m.moduleId === 'envelope');
  const hasGoalsModule = activeModules.some((m) => m.moduleId === 'goals');

  // Get current month data
  const now = new Date();
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

  // Last month for comparison
  const lastMonth = subMonths(now, 1);
  const lastMonthStart = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
  const lastMonthEnd = format(endOfMonth(lastMonth), 'yyyy-MM-dd');

  // Get income this month
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

  // Get expenses this month
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

  // Get expenses last month
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

  // Get streak
  const streak = await getStreak(userId);

  // Calculate base factors
  // 1. Spending under income (0-15 points)
  let spendingUnderIncome = 0;
  if (monthlyIncome > 0) {
    if (monthlyExpenses <= monthlyIncome * 0.8) {
      spendingUnderIncome = 15; // Great: spending <= 80% of income
    } else if (monthlyExpenses <= monthlyIncome) {
      spendingUnderIncome = 10; // Good: spending <= income
    } else if (monthlyExpenses <= monthlyIncome * 1.1) {
      spendingUnderIncome = 5; // Fair: slightly over
    }
    // else: poor, 0 points
  }

  // 2. Consistent logging (0-15 points)
  let consistentLogging = 0;
  if (streak.currentStreak >= 30) {
    consistentLogging = 15; // Excellent habit
  } else if (streak.currentStreak >= 14) {
    consistentLogging = 12;
  } else if (streak.currentStreak >= 7) {
    consistentLogging = 9;
  } else if (streak.currentStreak >= 3) {
    consistentLogging = 5;
  } else if (streak.currentStreak >= 1) {
    consistentLogging = 2;
  }

  // 3. Spending trend (0-10 points)
  let spendingTrend = 0;
  if (lastMonthExpenses > 0) {
    const changePercent = ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    if (changePercent <= -10) {
      spendingTrend = 10; // Spending decreased significantly
    } else if (changePercent <= 0) {
      spendingTrend = 8; // Spending stable or slightly down
    } else if (changePercent <= 10) {
      spendingTrend = 5; // Minor increase
    } else {
      spendingTrend = 2; // Spending increased
    }
  } else {
    spendingTrend = 5; // No data to compare, neutral
  }

  const baseScore = spendingUnderIncome + consistentLogging + spendingTrend;

  // Calculate module factors
  let envelopeAdherence: number | undefined;
  let envelopeUtilization: number | undefined;
  let goalContributions: number | undefined;
  let goalOnTrack: number | undefined;
  let moduleScore = 0;

  if (hasEnvelopeModule) {
    // Get envelope data
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

    if (envelopes.length > 0) {
      // Envelope adherence: how many wallets are within budget
      const underBudget = envelopes.filter(
        (e) => e.currentAmount <= (e.targetAmount || 0)
      ).length;
      const adherenceRatio = underBudget / envelopes.length;
      envelopeAdherence = Math.round(adherenceRatio * 20);

      // Envelope utilization: are we using but not overspending?
      const wellUtilized = envelopes.filter((e) => {
        const utilization = e.targetAmount ? e.currentAmount / e.targetAmount : 0;
        return utilization > 0 && utilization <= 0.8;
      }).length;
      envelopeUtilization = Math.round((wellUtilized / envelopes.length) * 10);

      moduleScore += envelopeAdherence + envelopeUtilization;
    }
  }

  if (hasGoalsModule) {
    // Get goal data
    const goals = await db
      .select({
        currentAmount: allocations.currentAmount,
        targetAmount: allocations.targetAmount,
        deadline: allocations.deadline,
        createdAt: allocations.createdAt,
      })
      .from(allocations)
      .where(
        and(
          eq(allocations.userId, userId),
          eq(allocations.moduleType, 'goals'),
          eq(allocations.isActive, true)
        )
      );

    if (goals.length > 0) {
      // Goal contributions: are we making progress?
      const withProgress = goals.filter((g) => g.currentAmount > 0).length;
      goalContributions = Math.round((withProgress / goals.length) * 20);

      // Goal on track: for goals with deadlines, are we on track?
      const goalsWithDeadline = goals.filter((g) => g.deadline);
      if (goalsWithDeadline.length > 0) {
        const onTrack = goalsWithDeadline.filter((g) => {
          if (!g.deadline || !g.targetAmount) return false;
          const deadlineDate = new Date(g.deadline);
          const startDate = new Date(g.createdAt);
          const now = new Date();
          const totalDuration = deadlineDate.getTime() - startDate.getTime();
          const elapsed = now.getTime() - startDate.getTime();
          const expectedProgress = elapsed / totalDuration;
          const actualProgress = g.currentAmount / g.targetAmount;
          return actualProgress >= expectedProgress * 0.8; // Within 80% of expected
        }).length;
        goalOnTrack = Math.round((onTrack / goalsWithDeadline.length) * 10);
      } else {
        goalOnTrack = 5; // No deadlines, neutral
      }

      moduleScore += goalContributions + (goalOnTrack || 0);
    }
  }

  // Calculate total score
  // If no modules active, base score is out of 40, scale to 100
  // If modules active, combine base (40) + module (up to 60)
  let totalScore: number;
  if (!hasEnvelopeModule && !hasGoalsModule) {
    // Scale base score (0-40) to 0-100
    totalScore = Math.round((baseScore / 40) * 100);
  } else {
    // Base + module factors (max 40 + max 60 = 100)
    totalScore = Math.min(100, baseScore + moduleScore);
  }

  // Determine level and message
  let level: 'poor' | 'fair' | 'good' | 'excellent';
  let message: string;

  if (totalScore >= 80) {
    level = 'excellent';
    message = 'Your finances are in great shape!';
  } else if (totalScore >= 60) {
    level = 'good';
    message = 'You\'re doing well. Keep it up!';
  } else if (totalScore >= 40) {
    level = 'fair';
    message = 'There\'s room for improvement.';
  } else {
    level = 'poor';
    message = 'Let\'s work on building better habits.';
  }

  return {
    spendingUnderIncome,
    consistentLogging,
    spendingTrend,
    envelopeAdherence,
    envelopeUtilization,
    goalContributions,
    goalOnTrack,
    baseScore,
    moduleScore,
    totalScore,
    level,
    message,
  };
}
