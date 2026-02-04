import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/server/queries/user';
import { redirect } from 'next/navigation';
import { CharacterChangeClient } from '@/components/settings/character-change-client';
import { CHARACTERS } from '@/lib/constants';

export default async function CharacterChangePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getUserProfile(user.id);
  const currentCharacterId = profile?.characterId || null;

  // Get available characters
  const availableCharacters = Object.values(CHARACTERS).filter(c => c.available);

  return (
    <CharacterChangeClient
      currentCharacterId={currentCharacterId}
      availableCharacters={availableCharacters}
    />
  );
}
