import { createClient } from '@/lib/supabase/server';
import { getUserModulesWithStatus } from '@/server/queries/settings';
import { redirect } from 'next/navigation';
import { ModuleLibraryClient } from '@/components/settings/module-library-client';
import { getAllModules } from '@/modules/registry';

export default async function ModuleLibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userModules = await getUserModulesWithStatus(user.id);
  const allModules = getAllModules();

  // Create a map of module active status
  const moduleStatusMap: Record<string, boolean> = {};
  for (const mod of userModules) {
    moduleStatusMap[mod.moduleId] = mod.isActive;
  }

  return (
    <ModuleLibraryClient
      allModules={allModules}
      moduleStatusMap={moduleStatusMap}
    />
  );
}
