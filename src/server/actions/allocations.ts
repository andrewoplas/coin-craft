'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveEnvelopes } from '@/server/queries/allocations';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Server action to fetch active envelopes for the current user
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
