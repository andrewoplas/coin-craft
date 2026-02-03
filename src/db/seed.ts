import { db } from './index';
import { categories, achievements } from './schema';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_ACHIEVEMENTS } from '../lib/constants';
import { eq, isNull } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding database...');

  // Seed system categories
  console.log('Seeding categories...');

  const allCategories = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];

  for (const categoryData of allCategories) {
    // Insert main category
    const [mainCategory] = await db
      .insert(categories)
      .values({
        userId: null, // System category
        name: categoryData.name,
        type: categoryData.type,
        icon: categoryData.icon,
        color: categoryData.color,
        parentId: null,
        isSystem: true,
        isHidden: false,
        sortOrder: 0,
      })
      .onConflictDoNothing()
      .returning();

    // Insert subcategories if any
    if (categoryData.subcategories && mainCategory) {
      for (let i = 0; i < categoryData.subcategories.length; i++) {
        await db
          .insert(categories)
          .values({
            userId: null,
            name: categoryData.subcategories[i],
            type: categoryData.type,
            icon: categoryData.icon,
            color: categoryData.color,
            parentId: mainCategory.id,
            isSystem: true,
            isHidden: false,
            sortOrder: i,
          })
          .onConflictDoNothing();
      }
    }
  }

  console.log('✓ Categories seeded');

  // Seed achievements
  console.log('Seeding achievements...');

  for (const achievement of DEFAULT_ACHIEVEMENTS) {
    await db
      .insert(achievements)
      .values({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        requirement: achievement.requirement,
        sortOrder: 0,
      })
      .onConflictDoNothing();
  }

  console.log('✓ Achievements seeded');

  console.log('✅ Database seeded successfully!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seeding failed:');
  console.error(error);
  process.exit(1);
});
