'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { transactions, allocationTransactions, allocations, streaks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { toCentavos } from '@/lib/format';

export type CreateTransactionInput = {
  type: 'expense' | 'income' | 'transfer';
  amount: number; // in pesos
  categoryId: string;
  accountId: string;
  toAccountId?: string; // required for transfers
  date: string; // YYYY-MM-DD format
  note?: string;
  allocationId?: string; // optional envelope or goal allocation
};

export type CreateTransactionResult = {
  success: boolean;
  transactionId?: string;
  error?: string;
};

export async function createTransaction(
  input: CreateTransactionInput
): Promise<CreateTransactionResult> {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate transfer has toAccountId
    if (input.type === 'transfer' && !input.toAccountId) {
      return { success: false, error: 'Transfer requires destination account' };
    }

    // Validate amount is positive
    if (input.amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    // Convert amount to centavos
    const amountInCentavos = toCentavos(input.amount);

    // Insert transaction
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId: user.id,
        type: input.type,
        amount: amountInCentavos,
        currency: 'PHP',
        categoryId: input.categoryId,
        accountId: input.accountId,
        toAccountId: input.toAccountId || null,
        date: input.date,
        note: input.note || null,
      })
      .returning({ id: transactions.id });

    // Handle allocation linking (envelope or goal)
    if (input.allocationId) {
      await db.insert(allocationTransactions).values({
        transactionId: transaction.id,
        allocationId: input.allocationId,
        amount: amountInCentavos,
      });

      // Update allocation current amount
      const [allocation] = await db
        .select()
        .from(allocations)
        .where(eq(allocations.id, input.allocationId))
        .limit(1);

      if (allocation) {
        const newAmount = allocation.currentAmount + amountInCentavos;
        await db
          .update(allocations)
          .set({ currentAmount: newAmount })
          .where(eq(allocations.id, input.allocationId));
      }
    }

    // Update streak
    await updateStreak(user.id, input.date);

    // Revalidate to refresh server components
    revalidatePath('/dashboard');
    revalidatePath('/transactions');

    return { success: true, transactionId: transaction.id };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create transaction',
    };
  }
}

async function updateStreak(userId: string, transactionDate: string): Promise<void> {
  // Get existing streak record
  const [existingStreak] = await db
    .select()
    .from(streaks)
    .where(eq(streaks.userId, userId))
    .limit(1);

  const today = new Date(transactionDate);
  const todayString = transactionDate;

  if (!existingStreak) {
    // Create new streak record
    await db.insert(streaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastLogDate: todayString,
    });
    return;
  }

  // Check if already logged today
  if (existingStreak.lastLogDate === todayString) {
    return; // No update needed
  }

  // Calculate streak
  let newCurrentStreak = existingStreak.currentStreak;

  if (existingStreak.lastLogDate) {
    const lastLog = new Date(existingStreak.lastLogDate);
    const daysDiff = Math.floor(
      (today.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      // Logged yesterday, increment streak
      newCurrentStreak = existingStreak.currentStreak + 1;
    } else if (daysDiff > 1) {
      // Streak broken, reset to 1
      newCurrentStreak = 1;
    }
    // daysDiff === 0 shouldn't happen (already handled above)
  } else {
    // First log ever
    newCurrentStreak = 1;
  }

  // Update longest streak if necessary
  const newLongestStreak = Math.max(newCurrentStreak, existingStreak.longestStreak);

  // Update streak record
  await db
    .update(streaks)
    .set({
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastLogDate: todayString,
    })
    .where(eq(streaks.userId, userId));
}
