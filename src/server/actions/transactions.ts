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

export type UpdateTransactionInput = {
  transactionId: string;
  type?: 'expense' | 'income' | 'transfer';
  amount?: number; // in pesos
  categoryId?: string;
  accountId?: string;
  toAccountId?: string;
  date?: string; // YYYY-MM-DD format
  note?: string;
  allocationId?: string | null; // null = remove allocation
};

export type UpdateTransactionResult = {
  success: boolean;
  error?: string;
};

export type DeleteTransactionInput = {
  transactionId: string;
};

export type DeleteTransactionResult = {
  success: boolean;
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

export async function updateTransaction(
  input: UpdateTransactionInput
): Promise<UpdateTransactionResult> {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch existing transaction and verify ownership
    const [existingTransaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, input.transactionId))
      .limit(1);

    if (!existingTransaction) {
      return { success: false, error: 'Transaction not found' };
    }

    if (existingTransaction.userId !== user.id) {
      return { success: false, error: 'Not authorized to update this transaction' };
    }

    // Validate amount if provided
    if (input.amount !== undefined && input.amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    // Determine final transaction type
    const finalType = input.type ?? existingTransaction.type;

    // Validate transfer requirements
    if (finalType === 'transfer') {
      const finalToAccountId = input.toAccountId ?? existingTransaction.toAccountId;
      if (!finalToAccountId) {
        return { success: false, error: 'Transfer requires destination account' };
      }
    }

    // Build update object
    const updateData: Partial<typeof existingTransaction> = {
      updatedAt: new Date(),
    };

    if (input.type !== undefined) updateData.type = input.type;
    if (input.amount !== undefined) updateData.amount = toCentavos(input.amount);
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
    if (input.accountId !== undefined) updateData.accountId = input.accountId;
    if (input.toAccountId !== undefined) updateData.toAccountId = input.toAccountId;
    if (input.date !== undefined) updateData.date = input.date;
    if (input.note !== undefined) updateData.note = input.note;

    // Handle allocation changes
    const amountInCentavos = input.amount !== undefined ? toCentavos(input.amount) : existingTransaction.amount;

    // Fetch existing allocation link
    const [existingAllocationLink] = await db
      .select()
      .from(allocationTransactions)
      .where(eq(allocationTransactions.transactionId, input.transactionId))
      .limit(1);

    const oldAllocationId = existingAllocationLink?.allocationId;
    const newAllocationId = input.allocationId === null ? undefined : (input.allocationId ?? oldAllocationId);

    // Remove old allocation if changed
    if (oldAllocationId && oldAllocationId !== newAllocationId) {
      // Delete allocation link
      await db
        .delete(allocationTransactions)
        .where(eq(allocationTransactions.transactionId, input.transactionId));

      // Subtract amount from old allocation
      const [oldAllocation] = await db
        .select()
        .from(allocations)
        .where(eq(allocations.id, oldAllocationId))
        .limit(1);

      if (oldAllocation) {
        const newAmount = oldAllocation.currentAmount - existingTransaction.amount;
        await db
          .update(allocations)
          .set({ currentAmount: newAmount })
          .where(eq(allocations.id, oldAllocationId));
      }
    }

    // Add new allocation if changed
    if (newAllocationId && newAllocationId !== oldAllocationId) {
      // Insert new allocation link
      await db.insert(allocationTransactions).values({
        transactionId: input.transactionId,
        allocationId: newAllocationId,
        amount: amountInCentavos,
      });

      // Add amount to new allocation
      const [newAllocation] = await db
        .select()
        .from(allocations)
        .where(eq(allocations.id, newAllocationId))
        .limit(1);

      if (newAllocation) {
        const updatedAmount = newAllocation.currentAmount + amountInCentavos;
        await db
          .update(allocations)
          .set({ currentAmount: updatedAmount })
          .where(eq(allocations.id, newAllocationId));
      }
    }

    // If allocation stayed the same but amount changed, update the difference
    if (oldAllocationId && oldAllocationId === newAllocationId && input.amount !== undefined) {
      const amountDifference = amountInCentavos - existingTransaction.amount;

      // Update allocation link amount
      await db
        .update(allocationTransactions)
        .set({ amount: amountInCentavos })
        .where(eq(allocationTransactions.transactionId, input.transactionId));

      // Update allocation currentAmount
      const [allocation] = await db
        .select()
        .from(allocations)
        .where(eq(allocations.id, oldAllocationId))
        .limit(1);

      if (allocation) {
        const updatedAmount = allocation.currentAmount + amountDifference;
        await db
          .update(allocations)
          .set({ currentAmount: updatedAmount })
          .where(eq(allocations.id, oldAllocationId));
      }
    }

    // Update transaction record
    await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, input.transactionId));

    // Update streak if date changed
    if (input.date !== undefined && input.date !== existingTransaction.date) {
      await updateStreak(user.id, input.date);
    }

    // Revalidate to refresh server components
    revalidatePath('/dashboard');
    revalidatePath('/transactions');

    return { success: true };
  } catch (error) {
    console.error('Error updating transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update transaction',
    };
  }
}

export async function deleteTransaction(
  input: DeleteTransactionInput
): Promise<DeleteTransactionResult> {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch existing transaction and verify ownership
    const [existingTransaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, input.transactionId))
      .limit(1);

    if (!existingTransaction) {
      return { success: false, error: 'Transaction not found' };
    }

    if (existingTransaction.userId !== user.id) {
      return { success: false, error: 'Not authorized to delete this transaction' };
    }

    // Handle allocation removal if transaction has allocation link
    const [existingAllocationLink] = await db
      .select()
      .from(allocationTransactions)
      .where(eq(allocationTransactions.transactionId, input.transactionId))
      .limit(1);

    if (existingAllocationLink) {
      // Subtract transaction amount from allocation
      const [allocation] = await db
        .select()
        .from(allocations)
        .where(eq(allocations.id, existingAllocationLink.allocationId))
        .limit(1);

      if (allocation) {
        const newAmount = allocation.currentAmount - existingTransaction.amount;
        await db
          .update(allocations)
          .set({ currentAmount: newAmount })
          .where(eq(allocations.id, existingAllocationLink.allocationId));
      }

      // Delete allocation link
      await db
        .delete(allocationTransactions)
        .where(eq(allocationTransactions.transactionId, input.transactionId));
    }

    // Delete transaction record
    await db
      .delete(transactions)
      .where(eq(transactions.id, input.transactionId));

    // Revalidate to refresh server components
    revalidatePath('/dashboard');
    revalidatePath('/transactions');

    return { success: true };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete transaction',
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
