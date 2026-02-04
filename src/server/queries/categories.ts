import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq, and, isNull, or } from 'drizzle-orm';
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
};

export type CategoryWithSubcategories = Category & {
  subcategories: Category[];
};

/**
 * Get all categories for a user (both system and user-created)
 * Returns main categories with their subcategories nested
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

  // Separate main categories (parentId = null) and subcategories
  const mainCategories: CategoryWithSubcategories[] = [];
  const subcategoriesMap = new Map<string, Category[]>();

  for (const cat of allCategories) {
    if (cat.parentId === null) {
      mainCategories.push({
        ...cat,
        subcategories: [],
      });
    } else {
      if (!subcategoriesMap.has(cat.parentId)) {
        subcategoriesMap.set(cat.parentId, []);
      }
      subcategoriesMap.get(cat.parentId)!.push(cat);
    }
  }

  // Attach subcategories to their parent categories
  for (const mainCat of mainCategories) {
    mainCat.subcategories = subcategoriesMap.get(mainCat.id) || [];
  }

  return mainCategories;
}
