'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { data: authData, error } = await supabase.auth.signUp(data);

  if (error) {
    throw new Error(error.message);
  }

  // Create user profile with default settings
  if (authData.user) {
    await db.insert(userProfiles).values({
      id: authData.user.id,
      displayName: null,
      characterId: null, // Will be set during onboarding
      defaultCurrency: 'PHP',
      settings: JSON.stringify({
        theme: 'system',
        initialDayOfMonth: 1,
        dateFormat: 'MMM d, yyyy',
      }),
    });
  }

  revalidatePath('/', 'layout');
  redirect('/onboarding');
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
