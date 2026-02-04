'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserAccounts } from '@/server/queries/accounts';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

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
