'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveEnvelopes, getActiveGoals } from '@/server/queries/allocations';
import { checkAndResetEnvelopePeriods } from '@/server/actions/envelopes';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Server action to fetch active envelopes for the current user
 * Also checks and resets envelope periods if needed
 */
export async function fetchActiveEnvelopes() {
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
    // Check and reset envelope periods before fetching
    await checkAndResetEnvelopePeriods(user.id);

    const envelopes = await getActiveEnvelopes(user.id);
    return {
      success: true,
      data: envelopes,
    } as const;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch envelopes',
    } as const;
  }
}

/**
 * Server action to fetch active goals for the current user
 */
export async function fetchActiveGoals() {
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
    const goals = await getActiveGoals(user.id);
    return {
      success: true,
      data: goals,
    } as const;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch goals',
    } as const;
  }
}
