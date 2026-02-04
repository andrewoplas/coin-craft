'use server';

import { revalidatePath } from 'next/cache';
import { eq, and, or, count } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { getUserCategories } from '@/server/queries/categories';
import { db } from '@/db';
import { categories, transactions } from '@/db/schema';
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

export type UpdateCategoryInput = {
  categoryId: string;
  name?: string;
  icon?: string;
  color?: string;
};

export type UpdateCategoryResult = {
  success: boolean;
  error?: string;
};

export type HideCategoryInput = {
  categoryId: string;
};

export type HideCategoryResult = {
  success: boolean;
  error?: string;
};

export type DeleteCategoryInput = {
  categoryId: string;
};

export type DeleteCategoryResult = {
  success: boolean;
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

/**
 * Server action to update an existing category
 * Only allows updating name, icon, and color (type and parent are locked)
 */
export async function updateCategory(
  input: UpdateCategoryInput
): Promise<UpdateCategoryResult> {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch existing category and verify ownership
    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, input.categoryId))
      .limit(1);

    if (!existingCategory) {
      return { success: false, error: 'Category not found' };
    }

    // Prevent editing system categories
    if (existingCategory.isSystem) {
      return { success: false, error: 'Cannot edit system categories' };
    }

    if (existingCategory.userId !== user.id) {
      return { success: false, error: 'Not authorized to update this category' };
    }

    // Validate name if provided
    if (input.name !== undefined && !input.name.trim()) {
      return { success: false, error: 'Category name cannot be empty' };
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

    // Update category
    await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, input.categoryId));

    // Revalidate pages to refresh server components
    revalidatePath('/categories');
    revalidatePath('/transactions');

    return { success: true };
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update category',
    };
  }
}

/**
 * Server action to hide a system category (soft delete)
 * Sets isHidden=true to hide category from main view while preserving all data
 * Only works for system categories (isSystem=true)
 */
export async function hideCategory(
  input: HideCategoryInput
): Promise<HideCategoryResult> {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch existing category
    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, input.categoryId))
      .limit(1);

    if (!existingCategory) {
      return { success: false, error: 'Category not found' };
    }

    // Only system categories can be hidden
    if (!existingCategory.isSystem) {
      return {
        success: false,
        error: 'Only system categories can be hidden. User categories can be deleted.',
      };
    }

    // Hide category by setting isHidden=true
    await db
      .update(categories)
      .set({ isHidden: true })
      .where(eq(categories.id, input.categoryId));

    // Revalidate pages to refresh server components
    revalidatePath('/categories');
    revalidatePath('/transactions');

    return { success: true };
  } catch (error) {
    console.error('Error hiding category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to hide category',
    };
  }
}

/**
 * Server action to delete a user-created category (hard delete)
 * Prevents deletion of:
 * - System categories (use hideCategory instead)
 * - Categories with existing transactions
 * Also deletes any subcategories recursively
 */
export async function deleteCategory(
  input: DeleteCategoryInput
): Promise<DeleteCategoryResult> {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch existing category and verify ownership
    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, input.categoryId))
      .limit(1);

    if (!existingCategory) {
      return { success: false, error: 'Category not found' };
    }

    // Prevent deleting system categories
    if (existingCategory.isSystem) {
      return {
        success: false,
        error: 'Cannot delete system categories. Use hide instead.',
      };
    }

    // Verify ownership
    if (existingCategory.userId !== user.id) {
      return { success: false, error: 'Not authorized to delete this category' };
    }

    // Check for existing transactions using this category or any of its subcategories
    const subcategoryList = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.parentId, input.categoryId));

    // Collect all category IDs to check (main category + subcategories)
    const categoryIdsToCheck = [
      input.categoryId,
      ...subcategoryList.map((sub) => sub.id),
    ];

    // Check if any transactions exist for these categories
    const [transactionCountResult] = await db
      .select({ count: count() })
      .from(transactions)
      .where(
        or(
          ...categoryIdsToCheck.map((id) => eq(transactions.categoryId, id))
        )
      );

    const transactionCount = transactionCountResult?.count || 0;

    if (transactionCount > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${transactionCount} existing transaction${transactionCount > 1 ? 's' : ''}. Delete or recategorize transactions first.`,
      };
    }

    // Delete subcategories first (if any exist)
    if (subcategoryList.length > 0) {
      await db
        .delete(categories)
        .where(eq(categories.parentId, input.categoryId));
    }

    // Delete the main category
    await db.delete(categories).where(eq(categories.id, input.categoryId));

    // Revalidate pages to refresh server components
    revalidatePath('/categories');
    revalidatePath('/transactions');

    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete category',
    };
  }
}
