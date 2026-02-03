import { db } from '@/db';
import { userModules, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getUserActiveModules(userId: string): Promise<string[]> {
  const modules = await db
    .select({ moduleId: userModules.moduleId })
    .from(userModules)
    .where(
      eq(userModules.userId, userId)
    );

  return modules
    .filter((m: { moduleId: string }) => m.moduleId)
    .map((m: { moduleId: string }) => m.moduleId);
}

export async function getUserProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, userId))
    .limit(1);

  return profile || null;
}
