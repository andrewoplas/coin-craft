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

export type EnvelopeDetail = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  currentAmount: number;
  targetAmount: number | null;
  period: string | null;
  periodStart: string | null;
  config: string | null;
  categoryIds: string[] | null;
  sortOrder: number;
  isActive: boolean;
};

export type EnvelopeTransaction = {
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
  allocationAmount: number; // Amount allocated to this envelope (in centavos)
};

/**
 * Fetch a single envelope by ID with ownership verification
 */
export async function getEnvelopeById(
  envelopeId: string,
  userId: string
): Promise<EnvelopeDetail | null> {
  const result = await db
    .select({
      id: allocations.id,
      name: allocations.name,
      icon: allocations.icon,
      color: allocations.color,
      currentAmount: allocations.currentAmount,
      targetAmount: allocations.targetAmount,
      period: allocations.period,
      periodStart: allocations.periodStart,
      config: allocations.config,
      categoryIds: allocations.categoryIds,
      sortOrder: allocations.sortOrder,
      isActive: allocations.isActive,
    })
    .from(allocations)
    .where(
      and(
        eq(allocations.id, envelopeId),
        eq(allocations.userId, userId),
        eq(allocations.moduleType, 'envelope')
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Fetch transactions linked to a specific envelope
 * Returns transactions ordered by date descending (newest first)
 */
export async function getEnvelopeTransactions(
  envelopeId: string,
  userId: string
): Promise<EnvelopeTransaction[]> {
  // First, get all allocation_transactions for this envelope
  const allocLinks = await db
    .select({
      transactionId: allocationTransactions.transactionId,
      amount: allocationTransactions.amount,
    })
    .from(allocationTransactions)
    .where(eq(allocationTransactions.allocationId, envelopeId));

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
  const categoriesMap = new Map<string, any>();
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
  const accountsMap = new Map<string, any>();
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

  // Create a map of allocation amounts by transaction ID
  const allocationAmountMap = new Map<string, number>();
  for (const link of allocLinks) {
    allocationAmountMap.set(link.transactionId, link.amount);
  }

  // Assemble the result
  const result: EnvelopeTransaction[] = txs.map((tx) => {
    const category = categoriesMap.get(tx.categoryId);
    const account = accountsMap.get(tx.accountId);
    const allocationAmount = allocationAmountMap.get(tx.id) || 0;

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
      allocationAmount,
    };
  });

  return result;
}
