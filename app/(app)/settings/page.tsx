import { createClient } from '@/lib/supabase/server';
import { getUserSettings } from '@/server/queries/settings';
import { redirect } from 'next/navigation';
import { SettingsClient } from '@/components/settings/settings-client';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userSettings = await getUserSettings(user.id);

  return (
    <SettingsClient
      initialSettings={userSettings?.settings || {
        displayName: '',
        defaultCurrency: 'PHP',
        initialDayOfMonth: 1,
        dateFormat: 'MMM d, yyyy',
        theme: 'light',
      }}
      characterId={userSettings?.characterId || null}
    />
  );
}
