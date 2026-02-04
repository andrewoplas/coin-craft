import { db } from '@/db';
import { transactions, accounts, categories } from '@/db/schema';
import { eq, and, gte, lte, sum, count, desc, sql } from 'drizzle-orm';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { getAccountsWithBalances } from './accounts';

export type DashboardStats = {
  netWorth: number; // in centavos
  totalIncome: number; // in centavos for current month
  totalExpenses: number; // in centavos for current month
  cashFlow: number; // in centavos (income - expenses)
  transactionCount: number; // for current month
};

export type SpendingByCategory = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  amount: number; // in centavos
  percentage: number;
};

export type RecentTransaction = {
  id: string;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  date: string;
  note: string | null;
  categoryName: string;
  categoryIcon: string | null;
  accountName: string;
};

/**
 * Get dashboard summary stats for current month
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const now = new Date();
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

  // Get net worth (sum of all account balances)
  const accountsWithBalances = await getAccountsWithBalances(userId);
  const netWorth = accountsWithBalances.reduce((sum, acc) => sum + acc.currentBalance, 0);

  // Get income for current month
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

  // Get expenses for current month
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

  // Get transaction count for current month
  const countResult = await db
    .select({ count: count() })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, monthStart),
        lte(transactions.date, monthEnd)
      )
    );

  const totalIncome = Number(incomeResult[0]?.total || 0);
  const totalExpenses = Number(expenseResult[0]?.total || 0);
  const transactionCount = Number(countResult[0]?.count || 0);

  return {
    netWorth,
    totalIncome,
    totalExpenses,
    cashFlow: totalIncome - totalExpenses,
    transactionCount,
  };
}

/**
 * Get spending breakdown by category for current month
 */
export async function getSpendingByCategory(userId: string): Promise<SpendingByCategory[]> {
  const now = new Date();
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

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
        gte(transactions.date, monthStart),
        lte(transactions.date, monthEnd)
      )
    )
    .groupBy(transactions.categoryId, categories.name, categories.icon, categories.color)
    .orderBy(desc(sum(transactions.amount)));

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
 * Get recent transactions for dashboard
 */
export async function getRecentTransactions(
  userId: string,
  limit: number = 5
): Promise<RecentTransaction[]> {
  const result = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      date: transactions.date,
      note: transactions.note,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      accountName: accounts.name,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
    .limit(limit);

  return result as RecentTransaction[];
}

/**
 * Get income vs expenses data for bar chart (last 6 months)
 */
export async function getIncomeVsExpenses(
  userId: string
): Promise<{ month: string; income: number; expenses: number }[]> {
  const months: { month: string; income: number; expenses: number }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = format(startOfMonth(date), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(date), 'yyyy-MM-dd');
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

    months.push({
      month: monthLabel,
      income: Number(incomeResult[0]?.total || 0),
      expenses: Number(expenseResult[0]?.total || 0),
    });
  }

  return months;
}
