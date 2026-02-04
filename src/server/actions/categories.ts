'use server';

import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { getUserCategories } from '@/server/queries/categories';
import { db } from '@/db';
import { categories } from '@/db/schema';
import type { CategoryType } from '@/lib/types';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type CreateCategoryInput = {
  name: string;
  type: 'expense' | 'income';
  icon?: string;
  color?: string;
  parentId?: string | null;
};

export type CreateCategoryResult = {
  success: boolean;
  categoryId?: string;
  error?: string;
};

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

/**
 * Server action to create a new category
 */
export async function createCategory(
  input: CreateCategoryInput
): Promise<CreateCategoryResult> {
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
      return { success: false, error: 'Category name is required' };
    }

    if (!input.type) {
      return { success: false, error: 'Category type is required' };
    }

    // Validate type is valid
    if (input.type !== 'expense' && input.type !== 'income') {
      return { success: false, error: 'Category type must be expense or income' };
    }

    // If parentId provided, verify parent exists and has same type
    if (input.parentId) {
      const [parent] = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.id, input.parentId),
            eq(categories.type, input.type)
          )
        )
        .limit(1);

      if (!parent) {
        return {
          success: false,
          error: 'Parent category not found or has different type',
        };
      }

      // Verify parent belongs to user or is a system category
      if (parent.userId !== null && parent.userId !== user.id) {
        return {
          success: false,
          error: 'Not authorized to use this parent category',
        };
      }
    }

    // Insert category
    const [category] = await db
      .insert(categories)
      .values({
        userId: user.id,
        name: input.name.trim(),
        type: input.type,
        icon: input.icon || null,
        color: input.color || null,
        parentId: input.parentId || null,
        sortOrder: 0,
        isSystem: false,
        isHidden: false,
      })
      .returning({ id: categories.id });

    // Revalidate pages to refresh server components
    revalidatePath('/categories');
    revalidatePath('/transactions');

    return { success: true, categoryId: category.id };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create category',
    };
  }
}
