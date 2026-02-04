'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserCategories } from '@/server/queries/categories';
import type { CategoryType } from '@/lib/types';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Server action to fetch all categories for the current user
 * Returns main categories with nested subcategories
 */
export async function fetchAllCategories(type?: CategoryType) {
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
    const categories = await getUserCategories(user.id, type);
    return {
      success: true,
      data: categories,
    } as const;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories',
    } as const;
  }
}
