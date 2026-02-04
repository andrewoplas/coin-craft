import { db } from '@/db';
import { accounts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import type { AccountType } from '@/lib/types';

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  icon: string | null;
  color: string | null;
  initialBalance: number;
  currency: string;
  sortOrder: number;
};

/**
 * Get all active accounts for a user
 * Excludes archived accounts, ordered by sortOrder
 */
export async function getUserAccounts(userId: string): Promise<Account[]> {
  const userAccounts = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      type: accounts.type,
      icon: accounts.icon,
      color: accounts.color,
      initialBalance: accounts.initialBalance,
      currency: accounts.currency,
      sortOrder: accounts.sortOrder,
    })
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, userId),
        eq(accounts.isArchived, false)
      )
    )
    .orderBy(accounts.sortOrder);

  return userAccounts;
}
