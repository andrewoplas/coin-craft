import { db } from '@/db';
import {
  transactions,
  categories,
  accounts,
  allocationTransactions,
  allocations,
} from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import type { TransactionType, CategoryType, AccountType } from '@/lib/types';

export type TransactionWithRelations = {
  id: string;
  type: TransactionType;
  amount: number; // in centavos
  currency: string;
  date: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
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
  toAccount: {
    id: string;
    name: string;
    icon: string | null;
    type: AccountType;
  } | null;
  allocations: Array<{
    id: string;
    name: string;
    icon: string | null;
    moduleType: string;
  }>;
};

/**
 * Get all transactions for a user with related data
 * Returns transactions with category, account, toAccount (for transfers), and allocations
 * Ordered by date descending (newest first)
 */
export async function getUserTransactions(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<TransactionWithRelations[]> {
  const { limit = 50, offset = 0 } = options || {};

  // Fetch transactions with basic data
  const txs = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      currency: transactions.currency,
      date: transactions.date,
      note: transactions.note,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
      categoryId: transactions.categoryId,
      accountId: transactions.accountId,
      toAccountId: transactions.toAccountId,
    })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
    .limit(limit)
    .offset(offset);

  // Collect all unique IDs for batch fetching
  const categoryIds = new Set<string>();
  const accountIds = new Set<string>();
  const transactionIds: string[] = [];

  for (const tx of txs) {
    categoryIds.add(tx.categoryId);
    accountIds.add(tx.accountId);
    if (tx.toAccountId) {
      accountIds.add(tx.toAccountId);
    }
    transactionIds.push(tx.id);
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

  // Batch fetch allocation links
  const allocationsMap = new Map<string, Array<any>>();
  if (transactionIds.length > 0) {
    const allocLinks = await db
      .select({
        transactionId: allocationTransactions.transactionId,
        allocationId: allocationTransactions.allocationId,
      })
      .from(allocationTransactions)
      .where(inArray(allocationTransactions.transactionId, transactionIds));

    // Collect unique allocation IDs
    const allocationIds = new Set(allocLinks.map((link) => link.allocationId));

    // Batch fetch allocations
    const allocationDetailsMap = new Map<string, any>();
    if (allocationIds.size > 0) {
      const allocs = await db
        .select({
          id: allocations.id,
          name: allocations.name,
          icon: allocations.icon,
          moduleType: allocations.moduleType,
        })
        .from(allocations)
        .where(inArray(allocations.id, Array.from(allocationIds)));

      for (const alloc of allocs) {
        allocationDetailsMap.set(alloc.id, alloc);
      }
    }

    // Group allocations by transaction ID
    for (const link of allocLinks) {
      const alloc = allocationDetailsMap.get(link.allocationId);
      if (alloc) {
        if (!allocationsMap.has(link.transactionId)) {
          allocationsMap.set(link.transactionId, []);
        }
        allocationsMap.get(link.transactionId)!.push(alloc);
      }
    }
  }

  // Assemble the result
  const result: TransactionWithRelations[] = txs.map((tx) => {
    const category = categoriesMap.get(tx.categoryId);
    const account = accountsMap.get(tx.accountId);
    const toAccount = tx.toAccountId ? accountsMap.get(tx.toAccountId) : null;
    const txAllocations = allocationsMap.get(tx.id) || [];

    return {
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      date: tx.date,
      note: tx.note,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
      category: category || {
        id: '',
        name: 'Unknown',
        icon: null,
        color: null,
        type: 'expense' as CategoryType,
      },
      account: account || {
        id: '',
        name: 'Unknown',
        icon: null,
        type: 'cash' as AccountType,
      },
      toAccount: toAccount
        ? {
            id: toAccount.id,
            name: toAccount.name,
            icon: toAccount.icon,
            type: toAccount.type,
          }
        : null,
      allocations: txAllocations,
    };
  });

  return result;
}
