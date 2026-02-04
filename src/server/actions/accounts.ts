'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { getUserAccounts } from '@/server/queries/accounts';
import { db } from '@/db';
import { accounts } from '@/db/schema';
import { toCentavos } from '@/lib/format';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type CreateAccountInput = {
  name: string;
  type: 'cash' | 'bank' | 'e_wallet' | 'credit_card';
  icon?: string;
  color?: string;
  initialBalance: number; // in pesos
};

export type CreateAccountResult = {
  success: boolean;
  accountId?: string;
  error?: string;
};

export type UpdateAccountInput = {
  accountId: string;
  name?: string;
  icon?: string;
  color?: string;
};

export type UpdateAccountResult = {
  success: boolean;
  error?: string;
};

export type ArchiveAccountInput = {
  accountId: string;
};

export type ArchiveAccountResult = {
  success: boolean;
  error?: string;
};

/**
 * Server action to fetch all active accounts for the current user
 */
export async function fetchUserAccounts() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: 'Not authenticated',
    } as const;
  }

  try {
    const accounts = await getUserAccounts(user.id);
    return {
      success: true,
      data: accounts,
    } as const;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch accounts',
    } as const;
  }
}

/**
 * Server action to create a new account
 */
export async function createAccount(
  input: CreateAccountInput
): Promise<CreateAccountResult> {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate required fields
    if (!input.name?.trim()) {
      return { success: false, error: 'Account name is required' };
    }

    if (!input.type) {
      return { success: false, error: 'Account type is required' };
    }

    // Validate initial balance is not negative
    if (input.initialBalance < 0) {
      return { success: false, error: 'Initial balance cannot be negative' };
    }

    // Convert initial balance to centavos
    const initialBalanceInCentavos = toCentavos(input.initialBalance);

    // Insert account
    const [account] = await db
      .insert(accounts)
      .values({
        userId: user.id,
        name: input.name.trim(),
        type: input.type,
        currency: 'PHP',
        initialBalance: initialBalanceInCentavos,
        icon: input.icon || null,
        color: input.color || null,
        isArchived: false,
        sortOrder: 0,
      })
      .returning({ id: accounts.id });

    // Revalidate pages to refresh server components
    revalidatePath('/accounts');
    revalidatePath('/dashboard');

    return { success: true, accountId: account.id };
  } catch (error) {
    console.error('Error creating account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create account',
    };
  }
}

/**
 * Server action to update an existing account
 * Only allows updating name, icon, and color (type and initial balance are locked)
 */
export async function updateAccount(
  input: UpdateAccountInput
): Promise<UpdateAccountResult> {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch existing account and verify ownership
    const [existingAccount] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, input.accountId))
      .limit(1);

    if (!existingAccount) {
      return { success: false, error: 'Account not found' };
    }

    if (existingAccount.userId !== user.id) {
      return { success: false, error: 'Not authorized to update this account' };
    }

    // Validate name if provided
    if (input.name !== undefined && !input.name.trim()) {
      return { success: false, error: 'Account name cannot be empty' };
    }

    // Build update object with only changed fields
    const updateData: {
      name?: string;
      icon?: string | null;
      color?: string | null;
    } = {};

    if (input.name !== undefined) {
      updateData.name = input.name.trim();
    }

    if (input.icon !== undefined) {
      updateData.icon = input.icon || null;
    }

    if (input.color !== undefined) {
      updateData.color = input.color || null;
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return { success: true };
    }

    // Update account
    await db
      .update(accounts)
      .set(updateData)
      .where(eq(accounts.id, input.accountId));

    // Revalidate pages to refresh server components
    revalidatePath('/accounts');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error updating account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update account',
    };
  }
}

/**
 * Server action to archive an account (soft delete)
 * Sets isArchived=true to hide account from main view while preserving all data
 */
export async function archiveAccount(
  input: ArchiveAccountInput
): Promise<ArchiveAccountResult> {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch existing account and verify ownership
    const [existingAccount] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, input.accountId))
      .limit(1);

    if (!existingAccount) {
      return { success: false, error: 'Account not found' };
    }

    if (existingAccount.userId !== user.id) {
      return { success: false, error: 'Not authorized to archive this account' };
    }

    // Archive account by setting isArchived=true
    await db
      .update(accounts)
      .set({ isArchived: true })
      .where(eq(accounts.id, input.accountId));

    // Revalidate pages to refresh server components
    revalidatePath('/accounts');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error archiving account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to archive account',
    };
  }
}
