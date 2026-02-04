import { db } from '@/db';
import { accounts, transactions } from '@/db/schema';
import { eq, and, sum, sql } from 'drizzle-orm';
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

export type AccountWithBalance = Account & {
  currentBalance: number; // in centavos
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

/**
 * Get all active accounts with computed current balances
 * Balance = initialBalance + income - expense + transfers in - transfers out
 */
export async function getAccountsWithBalances(userId: string): Promise<AccountWithBalance[]> {
  // Fetch all active accounts
  const userAccounts = await getUserAccounts(userId);

  // Compute balance for each account
  const accountsWithBalances = await Promise.all(
    userAccounts.map(async (account) => {
      // Sum of income transactions to this account
      const incomeResult = await db
        .select({ total: sum(transactions.amount) })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.accountId, account.id),
            eq(transactions.type, 'income')
          )
        );

      // Sum of expense transactions from this account
      const expenseResult = await db
        .select({ total: sum(transactions.amount) })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.accountId, account.id),
            eq(transactions.type, 'expense')
          )
        );

      // Sum of transfers OUT from this account
      const transfersOutResult = await db
        .select({ total: sum(transactions.amount) })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.accountId, account.id),
            eq(transactions.type, 'transfer')
          )
        );

      // Sum of transfers IN to this account (where this account is toAccountId)
      const transfersInResult = await db
        .select({ total: sum(transactions.amount) })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.toAccountId, account.id),
            eq(transactions.type, 'transfer')
          )
        );

      const income = Number(incomeResult[0]?.total || 0);
      const expense = Number(expenseResult[0]?.total || 0);
      const transfersOut = Number(transfersOutResult[0]?.total || 0);
      const transfersIn = Number(transfersInResult[0]?.total || 0);

      const currentBalance = account.initialBalance + income - expense - transfersOut + transfersIn;

      return {
        ...account,
        currentBalance,
      };
    })
  );

  return accountsWithBalances;
}
