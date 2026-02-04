import { db } from '@/db';
import { transactions, allocations, userAchievements, achievements, categories } from '@/db/schema';
import { eq, and, sql, gte, lte, desc } from 'drizzle-orm';
import { startOfMonth, endOfMonth, format, parse, getDaysInMonth } from 'date-fns';
import { fromCentavos } from '@/lib/format';

export type MonthlyRecapData = {
  // Basic info
  month: string; // YYYY-MM
  monthName: string; // "January 2026"
  daysInMonth: number;
  daysLogged: number;

  // Financial summary
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number; // percentage

  // Top category
  topCategory: {
    name: string;
    icon: string;
    amount: number;
    percentage: number;
  } | null;

  // Biggest expense
  biggestExpense: {
    amount: number;
    category: string;
    categoryIcon: string;
    note: string | null;
    date: string;
  } | null;

  // Logging stats
  loggingStreak: number; // streak at end of month
  transactionCount: number;

  // Achievements earned this month
  achievementsEarned: {
    id: string;
    name: string;
    icon: string;
    earnedAt: Date;
  }[];

  // Module highlights
  envelopeHighlights?: {
    totalEnvelopes: number;
    underBudgetCount: number;
    totalBudget: number;
    totalSpent: number;
  };

  goalHighlights?: {
    totalGoals: number;
    totalSaved: number;
    goalsCompleted: number;
  };
};

/**
 * Get monthly recap data for a specific month
 * @param userId User ID
 * @param month Month in YYYY-MM format
 */
export async function getMonthlyRecap(
  userId: string,
  month: string
): Promise<MonthlyRecapData> {
  // Parse month
  const monthDate = parse(month + '-01', 'yyyy-MM-dd', new Date());
  const monthStart = format(startOfMonth(monthDate), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd');
  const monthName = format(monthDate, 'MMMM yyyy');
  const daysInMonth = getDaysInMonth(monthDate);

  // Get total income
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
  const totalIncome = fromCentavos(incomeResult?.total || 0);

  // Get total expenses
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
  const totalExpenses = fromCentavos(expenseResult?.total || 0);

  // Calculate net savings and rate
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Get transaction count
  const [txCountResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, monthStart),
        lte(transactions.date, monthEnd)
      )
    );
  const transactionCount = txCountResult?.count || 0;

  // Get unique days with transactions
  const [daysLoggedResult] = await db
    .select({ count: sql<number>`count(distinct date)::int` })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, monthStart),
        lte(transactions.date, monthEnd)
      )
    );
  const daysLogged = daysLoggedResult?.count || 0;

  // Get top spending category
  const categorySpending = await db
    .select({
      categoryId: transactions.categoryId,
      total: sql<number>`sum(amount)::int`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, monthStart),
        lte(transactions.date, monthEnd)
      )
    )
    .groupBy(transactions.categoryId)
    .orderBy(desc(sql`sum(amount)`))
    .limit(1);

  let topCategory = null;
  if (categorySpending.length > 0 && categorySpending[0].categoryId) {
    const [cat] = await db
      .select({ name: categories.name, icon: categories.icon })
      .from(categories)
      .where(eq(categories.id, categorySpending[0].categoryId))
      .limit(1);

    if (cat) {
      const amount = fromCentavos(categorySpending[0].total);
      topCategory = {
        name: cat.name,
        icon: cat.icon || '📦',
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      };
    }
  }

  // Get biggest expense
  const biggestExpenseData = await db
    .select({
      amount: transactions.amount,
      categoryId: transactions.categoryId,
      note: transactions.note,
      date: transactions.date,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, monthStart),
        lte(transactions.date, monthEnd)
      )
    )
    .orderBy(desc(transactions.amount))
    .limit(1);

  let biggestExpense = null;
  if (biggestExpenseData.length > 0) {
    const expense = biggestExpenseData[0];
    const [cat] = await db
      .select({ name: categories.name, icon: categories.icon })
      .from(categories)
      .where(eq(categories.id, expense.categoryId))
      .limit(1);

    biggestExpense = {
      amount: fromCentavos(expense.amount),
      category: cat?.name || 'Uncategorized',
      categoryIcon: cat?.icon || '📦',
      note: expense.note,
      date: expense.date,
    };
  }

  // Get achievements earned this month
  const monthStartDate = startOfMonth(monthDate);
  const monthEndDate = endOfMonth(monthDate);

  const achievementsEarnedData = await db
    .select({
      id: achievements.id,
      name: achievements.name,
      icon: achievements.icon,
      earnedAt: userAchievements.earnedAt,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(
      and(
        eq(userAchievements.userId, userId),
        gte(userAchievements.earnedAt, monthStartDate),
        lte(userAchievements.earnedAt, monthEndDate)
      )
    )
    .orderBy(userAchievements.earnedAt);

  // Get envelope highlights (if applicable)
  const envelopeData = await db
    .select({
      targetAmount: allocations.targetAmount,
      currentAmount: allocations.currentAmount,
    })
    .from(allocations)
    .where(
      and(
        eq(allocations.userId, userId),
        eq(allocations.moduleType, 'envelope'),
        eq(allocations.isActive, true)
      )
    );

  let envelopeHighlights;
  if (envelopeData.length > 0) {
    const totalBudget = envelopeData.reduce((sum, e) => sum + (e.targetAmount || 0), 0);
    const totalSpent = envelopeData.reduce((sum, e) => sum + e.currentAmount, 0);
    const underBudgetCount = envelopeData.filter(
      (e) => e.currentAmount <= (e.targetAmount || 0)
    ).length;

    envelopeHighlights = {
      totalEnvelopes: envelopeData.length,
      underBudgetCount,
      totalBudget: fromCentavos(totalBudget),
      totalSpent: fromCentavos(totalSpent),
    };
  }

  // Get goal highlights (if applicable)
  const goalData = await db
    .select({
      currentAmount: allocations.currentAmount,
      isActive: allocations.isActive,
    })
    .from(allocations)
    .where(
      and(
        eq(allocations.userId, userId),
        eq(allocations.moduleType, 'goals')
      )
    );

  let goalHighlights;
  if (goalData.length > 0) {
    const activeGoals = goalData.filter((g) => g.isActive);
    const completedGoals = goalData.filter((g) => !g.isActive);
    const totalSaved = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);

    goalHighlights = {
      totalGoals: activeGoals.length,
      totalSaved: fromCentavos(totalSaved),
      goalsCompleted: completedGoals.length,
    };
  }

  return {
    month,
    monthName,
    daysInMonth,
    daysLogged,
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    topCategory,
    biggestExpense,
    loggingStreak: daysLogged, // Simplified; actual streak tracking is in streaks table
    transactionCount,
    achievementsEarned: achievementsEarnedData,
    envelopeHighlights,
    goalHighlights,
  };
}

/**
 * Get list of months that have transactions
 */
export async function getRecapMonths(userId: string): Promise<string[]> {
  const result = await db
    .select({
      month: sql<string>`to_char(date::date, 'YYYY-MM')`,
    })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .groupBy(sql`to_char(date::date, 'YYYY-MM')`)
    .orderBy(desc(sql`to_char(date::date, 'YYYY-MM')`));

  return result.map((r) => r.month);
}
