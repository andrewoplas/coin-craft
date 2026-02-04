import { db } from '@/db';
import {
  transactions,
  categories,
  accounts,
  allocationTransactions,
  allocations,
} from '@/db/schema';
import { eq, and, desc, inArray, lt, or, gte, lte, ilike } from 'drizzle-orm';
import type { TransactionType, CategoryType, AccountType } from '@/lib/types';

export type PaginatedTransactions = {
  transactions: TransactionWithRelations[];
  hasMore: boolean;
  nextCursor?: string;
};

type TransactionCursor = {
  date: string;
  createdAt: string; // ISO string
  id: string;
};

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

export type TransactionFilters = {
  type?: TransactionType | 'all';
  accountId?: string;
  categoryId?: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  note?: string; // Search term for note field (case-insensitive partial match)
};

/**
 * Encode a transaction cursor for pagination
 */
function encodeCursor(cursor: TransactionCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64');
}

/**
 * Decode a transaction cursor from pagination
 */
function decodeCursor(encoded: string): TransactionCursor {
  return JSON.parse(Buffer.from(encoded, 'base64').toString());
}

/**
 * Get paginated transactions for a user with cursor-based pagination
 * Supports infinite scroll with stable cursors
 * Supports filtering by type, account, category, and date range
 */
export async function getUserTransactionsPaginated(
  userId: string,
  options?: {
    limit?: number;
    cursor?: string;
    filters?: TransactionFilters;
  }
): Promise<PaginatedTransactions> {
  const { limit = 50, cursor, filters } = options || {};

  // Decode cursor if provided
  let cursorData: TransactionCursor | null = null;
  if (cursor) {
    try {
      cursorData = decodeCursor(cursor);
    } catch (error) {
      // Invalid cursor, ignore and start from beginning
      cursorData = null;
    }
  }

  // Build where clause with cursor filter and filters
  const whereConditions = [eq(transactions.userId, userId)];

  if (cursorData) {
    // Filter for transactions older than cursor
    // Since we order by date DESC, createdAt DESC, id DESC
    // We want: date < cursor.date OR (date = cursor.date AND createdAt < cursor.createdAt) OR (date = cursor.date AND createdAt = cursor.createdAt AND id < cursor.id)
    whereConditions.push(
      or(
        lt(transactions.date, cursorData.date),
        and(
          eq(transactions.date, cursorData.date),
          lt(transactions.createdAt, new Date(cursorData.createdAt))
        ),
        and(
          eq(transactions.date, cursorData.date),
          eq(transactions.createdAt, new Date(cursorData.createdAt)),
          lt(transactions.id, cursorData.id)
        )
      )!
    );
  }

  // Apply filters
  if (filters?.type && filters.type !== 'all') {
    whereConditions.push(eq(transactions.type, filters.type));
  }
  if (filters?.accountId) {
    whereConditions.push(eq(transactions.accountId, filters.accountId));
  }
  if (filters?.categoryId) {
    whereConditions.push(eq(transactions.categoryId, filters.categoryId));
  }
  if (filters?.dateFrom) {
    whereConditions.push(gte(transactions.date, filters.dateFrom));
  }
  if (filters?.dateTo) {
    whereConditions.push(lte(transactions.date, filters.dateTo));
  }
  if (filters?.note) {
    whereConditions.push(ilike(transactions.note, `%${filters.note}%`));
  }

  // Fetch limit + 1 to check if there are more results
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
    .where(and(...whereConditions))
    .orderBy(desc(transactions.date), desc(transactions.createdAt), desc(transactions.id))
    .limit(limit + 1);

  // Check if there are more results
  const hasMore = txs.length > limit;
  const results = hasMore ? txs.slice(0, limit) : txs;

  // Collect all unique IDs for batch fetching
  const categoryIds = new Set<string>();
  const accountIds = new Set<string>();
  const transactionIds: string[] = [];

  for (const tx of results) {
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
  const transactionsList: TransactionWithRelations[] = results.map((tx) => {
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

  // Generate next cursor if there are more results
  let nextCursor: string | undefined;
  if (hasMore && results.length > 0) {
    const lastTx = results[results.length - 1];
    nextCursor = encodeCursor({
      date: lastTx.date,
      createdAt: lastTx.createdAt.toISOString(),
      id: lastTx.id,
    });
  }

  return {
    transactions: transactionsList,
    hasMore,
    nextCursor,
  };
}
