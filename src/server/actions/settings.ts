'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { userProfiles, userModules, transactions, accounts, categories, allocations, allocationTransactions, dashboardLayouts, streaks, userAchievements } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { type UserSettings } from '@/lib/types';
import { CHARACTERS } from '@/lib/constants';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type UpdateSettingsInput = {
  displayName?: string;
  defaultCurrency?: string;
  initialDayOfMonth?: number;
  dateFormat?: string;
  theme?: 'light' | 'dark' | 'system';
};

/**
 * Update user settings
 */
export async function updateSettings(input: UpdateSettingsInput): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get current profile
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, user.id))
      .limit(1);

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Parse existing settings
    let currentSettings: UserSettings = {
      displayName: '',
      defaultCurrency: 'PHP',
      initialDayOfMonth: 1,
      dateFormat: 'MMM d, yyyy',
      theme: 'light',
    };

    if (profile.settings) {
      try {
        currentSettings = { ...currentSettings, ...JSON.parse(profile.settings) };
      } catch {
        // Use defaults if parsing fails
      }
    }

    // Merge new settings
    const newSettings: UserSettings = {
      ...currentSettings,
      ...(input.displayName !== undefined && { displayName: input.displayName }),
      ...(input.defaultCurrency !== undefined && { defaultCurrency: input.defaultCurrency }),
      ...(input.initialDayOfMonth !== undefined && { initialDayOfMonth: input.initialDayOfMonth }),
      ...(input.dateFormat !== undefined && { dateFormat: input.dateFormat }),
      ...(input.theme !== undefined && { theme: input.theme }),
    };

    // Update profile
    await db
      .update(userProfiles)
      .set({
        displayName: newSettings.displayName || null,
        settings: JSON.stringify(newSettings),
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.id, user.id));

    revalidatePath('/settings');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Failed to update settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}

/**
 * Change user's character
 */
export async function changeCharacter(characterId: string, resetDashboard: boolean = false): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const character = CHARACTERS[characterId];
    if (!character || !character.available) {
      return { success: false, error: 'Invalid or unavailable character' };
    }

    // Update user profile with new character
    await db
      .update(userProfiles)
      .set({
        characterId,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.id, user.id));

    // Deactivate all modules first
    await db
      .update(userModules)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(userModules.userId, user.id));

    // Activate character's modules
    for (const moduleId of character.modules) {
      // Check if module already exists
      const [existing] = await db
        .select()
        .from(userModules)
        .where(
          and(
            eq(userModules.userId, user.id),
            eq(userModules.moduleId, moduleId)
          )
        )
        .limit(1);

      if (existing) {
        await db
          .update(userModules)
          .set({ isActive: true, updatedAt: new Date() })
          .where(eq(userModules.id, existing.id));
      } else {
        await db.insert(userModules).values({
          userId: user.id,
          moduleId,
          isActive: true,
          config: null,
        });
      }
    }

    // Optionally reset dashboard layout
    if (resetDashboard) {
      await db
        .delete(dashboardLayouts)
        .where(eq(dashboardLayouts.userId, user.id));
    }

    revalidatePath('/', 'layout');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Failed to change character:', error);
    return { success: false, error: 'Failed to change character' };
  }
}

/**
 * Enable or disable a module
 */
export async function toggleModule(moduleId: string, isActive: boolean): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Core and statistics modules cannot be disabled
    if ((moduleId === 'core' || moduleId === 'statistics') && !isActive) {
      return { success: false, error: 'Core modules cannot be disabled' };
    }

    // Check if module record exists
    const [existing] = await db
      .select()
      .from(userModules)
      .where(
        and(
          eq(userModules.userId, user.id),
          eq(userModules.moduleId, moduleId)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(userModules)
        .set({ isActive, updatedAt: new Date() })
        .where(eq(userModules.id, existing.id));
    } else {
      await db.insert(userModules).values({
        userId: user.id,
        moduleId,
        isActive,
        config: null,
      });
    }

    revalidatePath('/', 'layout');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Failed to toggle module:', error);
    return { success: false, error: 'Failed to toggle module' };
  }
}

/**
 * Export transactions to CSV
 */
export async function exportTransactionsCSV(): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get all transactions with category and account names
    const txns = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        currency: transactions.currency,
        date: transactions.date,
        note: transactions.note,
        createdAt: transactions.createdAt,
        categoryName: categories.name,
        accountName: accounts.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(eq(transactions.userId, user.id))
      .orderBy(transactions.date);

    // Generate CSV content
    const headers = ['Date', 'Type', 'Amount', 'Currency', 'Category', 'Account', 'Note', 'Created At'];
    const rows = txns.map(t => [
      t.date,
      t.type,
      String((t.amount || 0) / 100), // Convert centavos to pesos
      t.currency || 'PHP',
      t.categoryName || '',
      t.accountName || '',
      (t.note || '').replace(/"/g, '""'), // Escape quotes
      t.createdAt?.toISOString() || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return { success: true, data: csv };
  } catch (error) {
    console.error('Failed to export transactions:', error);
    return { success: false, error: 'Failed to export transactions' };
  }
}

/**
 * Delete user account and all data
 */
export async function deleteAccount(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Delete all user data in order (respecting foreign key constraints)
    // 1. Delete allocation transactions
    await db.delete(allocationTransactions)
      .where(
        eq(allocationTransactions.transactionId,
          db.select({ id: transactions.id })
            .from(transactions)
            .where(eq(transactions.userId, user.id))
        )
      );

    // 2. Delete transactions
    await db.delete(transactions).where(eq(transactions.userId, user.id));

    // 3. Delete allocations
    await db.delete(allocations).where(eq(allocations.userId, user.id));

    // 4. Delete accounts
    await db.delete(accounts).where(eq(accounts.userId, user.id));

    // 5. Delete categories (user-created only)
    await db.delete(categories).where(
      and(
        eq(categories.userId, user.id),
        eq(categories.isSystem, false)
      )
    );

    // 6. Delete user modules
    await db.delete(userModules).where(eq(userModules.userId, user.id));

    // 7. Delete dashboard layouts
    await db.delete(dashboardLayouts).where(eq(dashboardLayouts.userId, user.id));

    // 8. Delete streaks
    await db.delete(streaks).where(eq(streaks.userId, user.id));

    // 9. Delete user achievements
    await db.delete(userAchievements).where(eq(userAchievements.userId, user.id));

    // 10. Delete user profile
    await db.delete(userProfiles).where(eq(userProfiles.id, user.id));

    // 11. Delete Supabase auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
    if (authError) {
      // If admin delete fails, try to sign out at least
      await supabase.auth.signOut();
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Failed to delete account:', error);
    return { success: false, error: 'Failed to delete account' };
  }
}
