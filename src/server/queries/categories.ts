import { db } from '@/db';
import { categories, transactions } from '@/db/schema';
import { eq, and, isNull, or, count, sql } from 'drizzle-orm';
import type { CategoryType } from '@/lib/types';

export type Category = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  type: CategoryType;
  parentId: string | null;
  sortOrder: number;
  isSystem: boolean;
  userId: string | null;
  transactionCount?: number;
};

export type CategoryWithSubcategories = Category & {
  subcategories: Category[];
};

/**
 * Get all categories for a user (both system and user-created)
 * Returns main categories with their subcategories nested, including transaction counts
 */
export async function getUserCategories(
  userId: string,
  type?: CategoryType
): Promise<CategoryWithSubcategories[]> {
  // Fetch all categories: system categories (userId = null) + user's custom categories
  const whereClause = type
    ? and(
        or(isNull(categories.userId), eq(categories.userId, userId)),
        eq(categories.type, type),
        eq(categories.isHidden, false)
      )
    : and(
        or(isNull(categories.userId), eq(categories.userId, userId)),
        eq(categories.isHidden, false)
      );

  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      icon: categories.icon,
      color: categories.color,
      type: categories.type,
      parentId: categories.parentId,
      sortOrder: categories.sortOrder,
      isSystem: categories.isSystem,
      userId: categories.userId,
    })
    .from(categories)
    .where(whereClause)
    .orderBy(categories.sortOrder);

  // Get transaction counts for each category
  const categoryIds = allCategories.map((cat) => cat.id);
  const countMap = new Map<string, number>();

  // Only query transaction counts if there are categories
  if (categoryIds.length > 0) {
    const transactionCounts = await db
      .select({
        categoryId: transactions.categoryId,
        count: count(),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          sql`${transactions.categoryId} IN (${sql.join(
            categoryIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        )
      )
      .groupBy(transactions.categoryId);

    // Create a map of category ID to transaction count
    for (const { categoryId, count: txCount } of transactionCounts) {
      countMap.set(categoryId, txCount);
    }
  }

  // Separate main categories (parentId = null) and subcategories
  const mainCategories: CategoryWithSubcategories[] = [];
  const subcategoriesMap = new Map<string, Category[]>();

  for (const cat of allCategories) {
    const categoryWithCount = {
      ...cat,
      transactionCount: countMap.get(cat.id) || 0,
    };

    if (cat.parentId === null) {
      mainCategories.push({
        ...categoryWithCount,
        subcategories: [],
      });
    } else {
      if (!subcategoriesMap.has(cat.parentId)) {
        subcategoriesMap.set(cat.parentId, []);
      }
      subcategoriesMap.get(cat.parentId)!.push(categoryWithCount);
    }
  }

  // Attach subcategories to their parent categories
  for (const mainCat of mainCategories) {
    mainCat.subcategories = subcategoriesMap.get(mainCat.id) || [];
  }

  return mainCategories;
}
