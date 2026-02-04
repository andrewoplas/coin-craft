import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserActiveModules, getUserProfile } from '@/server/queries/user';
import { getUserCategories } from '@/server/queries/categories';
import { getAccountsWithBalances } from '@/server/queries/accounts';
import { getActiveRoutes } from '@/modules/registry';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { QuickAddWrapper } from '@/components/transactions/quick-add-wrapper';
import { Toaster } from '@/components/ui/sonner';
import { CHARACTERS } from '@/lib/constants';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's active modules
  const activeModuleIds = await getUserActiveModules(user.id);
  const routes = getActiveRoutes(activeModuleIds);

  // Get user profile for character color
  const profile = await getUserProfile(user.id);
  const character = profile?.characterId ? CHARACTERS[profile.characterId] : null;
  const accentColor = character?.accentColor || '#3B82F6';

  // Fetch categories and accounts for Quick Add modal
  const [categories, accounts] = await Promise.all([
    getUserCategories(user.id),
    getAccountsWithBalances(user.id),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar routes={routes} accentColor={accentColor} />

      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      <MobileNav routes={routes} accentColor={accentColor} />

      <QuickAddWrapper
        activeModules={activeModuleIds}
        categories={categories}
        accounts={accounts}
      />

      <Toaster position="top-center" richColors />
    </div>
  );
}
