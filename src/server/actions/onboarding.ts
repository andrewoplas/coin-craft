'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { userProfiles, userModules, accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CHARACTERS } from '@/lib/constants';

type SetupData = {
  characterId: string;
  accounts: Array<{
    name: string;
    type: 'cash' | 'bank' | 'e_wallet' | 'credit_card';
    initialBalance: number;
    icon: string;
    color: string;
  }>;
};

export async function completeSetup(data: SetupData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const character = CHARACTERS[data.characterId];
  if (!character) {
    throw new Error('Invalid character');
  }

  // Update user profile with character
  await db
    .update(userProfiles)
    .set({
      characterId: data.characterId,
    })
    .where(eq(userProfiles.id, user.id));

  // Activate character's modules
  for (const moduleId of character.modules) {
    await db.insert(userModules).values({
      userId: user.id,
      moduleId,
      isActive: true,
      config: null,
    });
  }

  // Create accounts
  for (const account of data.accounts) {
    await db.insert(accounts).values({
      userId: user.id,
      name: account.name,
      type: account.type,
      currency: 'PHP',
      initialBalance: account.initialBalance, // in centavos
      icon: account.icon,
      color: account.color,
      isArchived: false,
      sortOrder: 0,
    });
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
