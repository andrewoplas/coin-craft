import { db } from '@/db';
import {
  allocations,
  transactions,
  allocationTransactions,
  categories,
  accounts,
} from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import type { TransactionType, CategoryType, AccountType } from '@/lib/types';

export type GoalDetail = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  currentAmount: number;
  targetAmount: number | null;
  deadline: string | null;
  config: string | null;
  createdAt: Date;
  sortOrder: number;
  isActive: boolean;
};

export type GoalContribution = {
  id: string;
  type: TransactionType;
  amount: number; // in centavos
  currency: string;
  date: string;
  note: string | null;
  createdAt: Date;
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
    type: CategoryType;
  };
  account: {
    id: string;
    name: string;
    icon: string | null;
    type: AccountType;
  };
  contributionAmount: number; // Amount contributed to this goal (in centavos)
};

/**
 * Fetch a single goal by ID with ownership verification
 */
export async function getGoalById(
  goalId: string,
  userId: string
): Promise<GoalDetail | null> {
  const result = await db
    .select({
      id: allocations.id,
      name: allocations.name,
      icon: allocations.icon,
      color: allocations.color,
      currentAmount: allocations.currentAmount,
      targetAmount: allocations.targetAmount,
      deadline: allocations.deadline,
      config: allocations.config,
      createdAt: allocations.createdAt,
      sortOrder: allocations.sortOrder,
      isActive: allocations.isActive,
    })
    .from(allocations)
    .where(
      and(
        eq(allocations.id, goalId),
        eq(allocations.userId, userId),
        eq(allocations.moduleType, 'goal')
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Fetch contributions/transactions linked to a specific goal
 * Returns contributions ordered by date descending (newest first)
 */
export async function getGoalContributions(
  goalId: string,
  userId: string
): Promise<GoalContribution[]> {
  // First, get all allocation_transactions for this goal
  const allocLinks = await db
    .select({
      transactionId: allocationTransactions.transactionId,
      amount: allocationTransactions.amount,
    })
    .from(allocationTransactions)
    .where(eq(allocationTransactions.allocationId, goalId));

  if (allocLinks.length === 0) {
    return [];
  }

  const transactionIds = allocLinks.map((link) => link.transactionId);

  // Fetch transactions with user ownership check
  const txs = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      currency: transactions.currency,
      date: transactions.date,
      note: transactions.note,
      createdAt: transactions.createdAt,
      categoryId: transactions.categoryId,
      accountId: transactions.accountId,
    })
    .from(transactions)
    .where(
      and(
        inArray(transactions.id, transactionIds),
        eq(transactions.userId, userId)
      )
    )
    .orderBy(desc(transactions.date), desc(transactions.createdAt));

  // Collect unique IDs for batch fetching
  const categoryIds = new Set<string>();
  const accountIds = new Set<string>();

  for (const tx of txs) {
    categoryIds.add(tx.categoryId);
    accountIds.add(tx.accountId);
  }

  // Batch fetch categories
  const categoriesMap = new Map<string, {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
    type: CategoryType;
  }>();
  if (categoryIds.size > 0) {
    const cats = await db
      .select({
        id: categories.id,
        name: categories.name,
        icon: categories.icon,
        color: categories.color,
        type: categories.type,
      })
      .from(categories)
      .where(inArray(categories.id, Array.from(categoryIds)));

    for (const cat of cats) {
      categoriesMap.set(cat.id, cat);
    }
  }

  // Batch fetch accounts
  const accountsMap = new Map<string, {
    id: string;
    name: string;
    icon: string | null;
    type: AccountType;
  }>();
  if (accountIds.size > 0) {
    const accs = await db
      .select({
        id: accounts.id,
        name: accounts.name,
        icon: accounts.icon,
        type: accounts.type,
      })
      .from(accounts)
      .where(inArray(accounts.id, Array.from(accountIds)));

    for (const acc of accs) {
      accountsMap.set(acc.id, acc);
    }
  }

  // Create a map of contribution amounts by transaction ID
  const contributionAmountMap = new Map<string, number>();
  for (const link of allocLinks) {
    contributionAmountMap.set(link.transactionId, link.amount);
  }

  // Assemble the result
  const result: GoalContribution[] = txs.map((tx) => {
    const category = categoriesMap.get(tx.categoryId);
    const account = accountsMap.get(tx.accountId);
    const contributionAmount = contributionAmountMap.get(tx.id) || 0;

    return {
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      date: tx.date,
      note: tx.note,
      createdAt: tx.createdAt,
      category: category || {
        id: tx.categoryId,
        name: 'Unknown',
        icon: null,
        color: null,
        type: 'expense' as CategoryType,
      },
      account: account || {
        id: tx.accountId,
        name: 'Unknown',
        icon: null,
        type: 'cash' as AccountType,
      },
      contributionAmount,
    };
  });

  return result;
}

/**
 * Calculate monthly savings statistics for a goal
 */
export type MonthlySavingsStats = {
  averageMonthlySavings: number; // in centavos
  lastMonthSavings: number; // in centavos
  currentMonthSavings: number; // in centavos
  projectedMonthsToGoal: number | null;
  requiredMonthlySavings: number | null; // if deadline set
};

export async function getGoalSavingsStats(
  goalId: string,
  userId: string,
  goal: GoalDetail
): Promise<MonthlySavingsStats> {
  const contributions = await getGoalContributions(goalId, userId);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Calculate current month and last month savings
  let currentMonthSavings = 0;
  let lastMonthSavings = 0;

  for (const contrib of contributions) {
    const date = new Date(contrib.date);
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      currentMonthSavings += contrib.contributionAmount;
    } else if (date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear) {
      lastMonthSavings += contrib.contributionAmount;
    }
  }

  // Calculate average monthly savings since goal creation
  const monthsSinceCreation = Math.max(
    1,
    (now.getFullYear() - goal.createdAt.getFullYear()) * 12 +
      (now.getMonth() - goal.createdAt.getMonth())
  );
  const averageMonthlySavings = goal.currentAmount / monthsSinceCreation;

  // Calculate projected months to goal
  const remaining = Math.max(0, (goal.targetAmount || 0) - goal.currentAmount);
  let projectedMonthsToGoal: number | null = null;
  if (averageMonthlySavings > 0 && remaining > 0) {
    projectedMonthsToGoal = Math.ceil(remaining / averageMonthlySavings);
  } else if (remaining === 0) {
    projectedMonthsToGoal = 0;
  }

  // Calculate required monthly savings if deadline set
  let requiredMonthlySavings: number | null = null;
  if (goal.deadline) {
    const deadlineDate = new Date(goal.deadline);
    const monthsUntilDeadline = Math.max(
      1,
      (deadlineDate.getFullYear() - now.getFullYear()) * 12 +
        (deadlineDate.getMonth() - now.getMonth())
    );
    if (remaining > 0) {
      requiredMonthlySavings = Math.ceil(remaining / monthsUntilDeadline);
    }
  }

  return {
    averageMonthlySavings: Math.round(averageMonthlySavings),
    lastMonthSavings,
    currentMonthSavings,
    projectedMonthsToGoal,
    requiredMonthlySavings,
  };
}
