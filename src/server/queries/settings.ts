import { db } from '@/db';
import { userProfiles, userModules } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { type UserSettings } from '@/lib/types';

export type UserSettingsWithProfile = {
  displayName: string | null;
  characterId: string | null;
  defaultCurrency: string;
  settings: UserSettings;
};

/**
 * Get user's settings including profile info
 */
export async function getUserSettings(userId: string): Promise<UserSettingsWithProfile | null> {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, userId))
    .limit(1);

  if (!profile) {
    return null;
  }

  // Parse settings JSON
  let settings: UserSettings = {
    displayName: profile.displayName || '',
    defaultCurrency: profile.defaultCurrency,
    initialDayOfMonth: 1,
    dateFormat: 'MMM d, yyyy',
    theme: 'light',
  };

  if (profile.settings) {
    try {
      const parsed = JSON.parse(profile.settings);
      settings = { ...settings, ...parsed };
    } catch {
      // Use defaults
    }
  }

  return {
    displayName: profile.displayName,
    characterId: profile.characterId,
    defaultCurrency: profile.defaultCurrency,
    settings,
  };
}

export type UserModule = {
  moduleId: string;
  isActive: boolean;
  config: string | null;
};

/**
 * Get user's modules with their status
 */
export async function getUserModulesWithStatus(userId: string): Promise<UserModule[]> {
  const modules = await db
    .select({
      moduleId: userModules.moduleId,
      isActive: userModules.isActive,
      config: userModules.config,
    })
    .from(userModules)
    .where(eq(userModules.userId, userId));

  return modules;
}
