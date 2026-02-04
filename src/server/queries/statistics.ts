import { db } from '@/db';
import { transactions, categories } from '@/db/schema';
import { eq, and, gte, lte, sum, count, desc, sql, asc } from 'drizzle-orm';
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  format,
  eachDayOfInterval,
  parseISO,
} from 'date-fns';

// Period filter types
export type PeriodFilter =
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'last-6-months'
  | 'this-year'
  | 'custom';

// Type definitions
export type CategorySpending = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  parentId: string | null;
  amount: number; // centavos
  percentage: number;
  transactionCount: number;
};

export type MonthlyCashFlow = {
  month: string; // YYYY-MM
  monthLabel: string; // Jan, Feb, etc.
  income: number; // centavos
  expenses: number; // centavos
  netCashFlow: number; // centavos
};

export type DailySpending = {
  date: string; // YYYY-MM-DD
  amount: number; // centavos
};

export type TopCategory = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  amount: number; // centavos
  percentage: number;
};

export type TrendData = {
  month: string; // YYYY-MM
  monthLabel: string; // Jan, Feb, etc.
  totalSpending: number; // centavos
  averageDailySpend: number; // centavos
  transactionCount: number;
};

export type PeriodComparison = {
  currentPeriod: {
    income: number;
    expenses: number;
    netCashFlow: number;
    transactionCount: number;
  };
  previousPeriod: {
    income: number;
    expenses: number;
    netCashFlow: number;
    transactionCount: number;
  };
  changes: {
    income: number; // percentage change
    expenses: number;
    netCashFlow: number;
    transactionCount: number;
  };
};

/**
 * Get date range from period filter
 */
export function getDateRangeFromPeriod(
  period: PeriodFilter,
  customFrom?: string,
  customTo?: string
): { dateFrom: string; dateTo: string } {
  const now = new Date();

  switch (period) {
    case 'this-month':
      return {
        dateFrom: format(startOfMonth(now), 'yyyy-MM-dd'),
        dateTo: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'last-month': {
      const lastMonth = subMonths(now, 1);
      return {
        dateFrom: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
        dateTo: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
      };
    }
    case 'last-3-months':
      return {
        dateFrom: format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd'),
        dateTo: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'last-6-months':
      return {
        dateFrom: format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd'),
        dateTo: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'this-year':
      return {
        dateFrom: format(startOfYear(now), 'yyyy-MM-dd'),
        dateTo: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'custom':
      return {
        dateFrom: customFrom || format(startOfMonth(now), 'yyyy-MM-dd'),
        dateTo: customTo || format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    default:
      return {
        dateFrom: format(startOfMonth(now), 'yyyy-MM-dd'),
        dateTo: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
  }
}

/**
 * Get spending breakdown by category for a date range
 */
export async function getSpendingByCategory(
  userId: string,
  dateFrom: string,
  dateTo: string
): Promise<CategorySpending[]> {
  const result = await db
    .select({
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
      parentId: categories.parentId,
      amount: sum(transactions.amount),
      transactionCount: count(),
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, dateFrom),
        lte(transactions.date, dateTo)
      )
    )
    .groupBy(
      transactions.categoryId,
      categories.name,
      categories.icon,
      categories.color,
      categories.parentId
    )
    .orderBy(desc(sum(transactions.amount)));

  const totalSpending = result.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return result.map((row) => ({
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    categoryIcon: row.categoryIcon,
    categoryColor: row.categoryColor,
    parentId: row.parentId,
    amount: Number(row.amount || 0),
    percentage: totalSpending > 0 ? (Number(row.amount || 0) / totalSpending) * 100 : 0,
    transactionCount: Number(row.transactionCount || 0),
  }));
}

/**
 * Get monthly cash flow data (income vs expenses by month)
 */
export async function getMonthlyCashFlow(
  userId: string,
  months: number = 6
): Promise<MonthlyCashFlow[]> {
  const result: MonthlyCashFlow[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    const monthStart = format(startOfMonth(date), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(date), 'yyyy-MM-dd');
    const monthKey = format(date, 'yyyy-MM');
    const monthLabel = format(date, 'MMM');

    const incomeResult = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'income'),
          gte(transactions.date, monthStart),
          lte(transactions.date, monthEnd)
        )
      );

    const expenseResult = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'expense'),
          gte(transactions.date, monthStart),
          lte(transactions.date, monthEnd)
        )
      );

    const income = Number(incomeResult[0]?.total || 0);
    const expenses = Number(expenseResult[0]?.total || 0);

    result.push({
      month: monthKey,
      monthLabel,
      income,
      expenses,
      netCashFlow: income - expenses,
    });
  }

  return result;
}

/**
 * Get daily spending for a date range
 */
export async function getDailySpending(
  userId: string,
  dateFrom: string,
  dateTo: string
): Promise<DailySpending[]> {
  // Get all expenses grouped by date
  const expensesByDate = await db
    .select({
      date: transactions.date,
      amount: sum(transactions.amount),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, dateFrom),
        lte(transactions.date, dateTo)
      )
    )
    .groupBy(transactions.date)
    .orderBy(asc(transactions.date));

  // Create a map for quick lookup
  const expenseMap = new Map(
    expensesByDate.map((row) => [row.date, Number(row.amount || 0)])
  );

  // Fill in all days in the range (including days with no spending)
  const days = eachDayOfInterval({
    start: parseISO(dateFrom),
    end: parseISO(dateTo),
  });

  return days.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return {
      date: dateStr,
      amount: expenseMap.get(dateStr) || 0,
    };
  });
}

/**
 * Get top spending categories
 */
export async function getTopCategories(
  userId: string,
  dateFrom: string,
  dateTo: string,
  limit: number = 5
): Promise<TopCategory[]> {
  const result = await db
    .select({
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
      amount: sum(transactions.amount),
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, dateFrom),
        lte(transactions.date, dateTo)
      )
    )
    .groupBy(transactions.categoryId, categories.name, categories.icon, categories.color)
    .orderBy(desc(sum(transactions.amount)))
    .limit(limit);

  const totalSpending = result.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return result.map((row) => ({
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    categoryIcon: row.categoryIcon,
    categoryColor: row.categoryColor,
    amount: Number(row.amount || 0),
    percentage: totalSpending > 0 ? (Number(row.amount || 0) / totalSpending) * 100 : 0,
  }));
}

/**
 * Get spending trends (monthly summary over 6 months)
 */
export async function getSpendingTrends(
  userId: string,
  months: number = 6
): Promise<TrendData[]> {
  const result: TrendData[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const monthStartStr = format(monthStart, 'yyyy-MM-dd');
    const monthEndStr = format(monthEnd, 'yyyy-MM-dd');
    const monthKey = format(date, 'yyyy-MM');
    const monthLabel = format(date, 'MMM');

    const expenseResult = await db
      .select({
        total: sum(transactions.amount),
        count: count(),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'expense'),
          gte(transactions.date, monthStartStr),
          lte(transactions.date, monthEndStr)
        )
      );

    const totalSpending = Number(expenseResult[0]?.total || 0);
    const transactionCount = Number(expenseResult[0]?.count || 0);

    // Calculate days in month
    const daysInMonth = Math.ceil(
      (monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    result.push({
      month: monthKey,
      monthLabel,
      totalSpending,
      averageDailySpend: daysInMonth > 0 ? Math.round(totalSpending / daysInMonth) : 0,
      transactionCount,
    });
  }

  return result;
}

/**
 * Get period-over-period comparison
 */
export async function getPeriodComparison(
  userId: string,
  period: PeriodFilter,
  customFrom?: string,
  customTo?: string
): Promise<PeriodComparison> {
  const { dateFrom, dateTo } = getDateRangeFromPeriod(period, customFrom, customTo);

  // Calculate previous period dates (same duration, offset back)
  const from = parseISO(dateFrom);
  const to = parseISO(dateTo);
  const duration = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - duration);

  const prevDateFrom = format(prevFrom, 'yyyy-MM-dd');
  const prevDateTo = format(prevTo, 'yyyy-MM-dd');

  // Get current period stats
  const currentStats = await getPeriodStats(userId, dateFrom, dateTo);
  const previousStats = await getPeriodStats(userId, prevDateFrom, prevDateTo);

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    currentPeriod: currentStats,
    previousPeriod: previousStats,
    changes: {
      income: calculateChange(currentStats.income, previousStats.income),
      expenses: calculateChange(currentStats.expenses, previousStats.expenses),
      netCashFlow: calculateChange(currentStats.netCashFlow, previousStats.netCashFlow),
      transactionCount: calculateChange(
        currentStats.transactionCount,
        previousStats.transactionCount
      ),
    },
  };
}

/**
 * Helper: Get period stats
 */
async function getPeriodStats(
  userId: string,
  dateFrom: string,
  dateTo: string
): Promise<{
  income: number;
  expenses: number;
  netCashFlow: number;
  transactionCount: number;
}> {
  const incomeResult = await db
    .select({ total: sum(transactions.amount), count: count() })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'income'),
        gte(transactions.date, dateFrom),
        lte(transactions.date, dateTo)
      )
    );

  const expenseResult = await db
    .select({ total: sum(transactions.amount), count: count() })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, dateFrom),
        lte(transactions.date, dateTo)
      )
    );

  const income = Number(incomeResult[0]?.total || 0);
  const expenses = Number(expenseResult[0]?.total || 0);
  const incomeCount = Number(incomeResult[0]?.count || 0);
  const expenseCount = Number(expenseResult[0]?.count || 0);

  return {
    income,
    expenses,
    netCashFlow: income - expenses,
    transactionCount: incomeCount + expenseCount,
  };
}

/**
 * Get total spending for a date range
 */
export async function getTotalSpending(
  userId: string,
  dateFrom: string,
  dateTo: string
): Promise<number> {
  const result = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, dateFrom),
        lte(transactions.date, dateTo)
      )
    );

  return Number(result[0]?.total || 0);
}

/**
 * Get average daily spending for a date range
 */
export async function getAverageDailySpending(
  userId: string,
  dateFrom: string,
  dateTo: string
): Promise<number> {
  const total = await getTotalSpending(userId, dateFrom, dateTo);
  const from = parseISO(dateFrom);
  const to = parseISO(dateTo);
  const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return days > 0 ? Math.round(total / days) : 0;
}
