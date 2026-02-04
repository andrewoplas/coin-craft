import { createClient } from '@/lib/supabase/server';
import { getUserProfile, getUserActiveModules } from '@/server/queries/user';
import { getUserNudges } from '@/server/queries/nudges';
import { getActiveWidgets } from '@/modules/registry';
import { CHARACTERS } from '@/lib/constants';
import { DashboardGrid } from '@/components/dashboard';
import { NudgeBanner } from '@/components/dashboard/nudge-banner';
import { type WidgetInstance } from '@/lib/types';

// Generate default layout based on character
function getDefaultLayout(characterId: string | null, activeModuleIds: string[]): WidgetInstance[] {
  const layout: WidgetInstance[] = [];
  let idCounter = 0;

  const generateId = () => `default-${idCounter++}`;

  // Core widgets always included
  layout.push({
    id: generateId(),
    moduleId: 'core',
    widgetId: 'net-worth',
    size: 'S',
    position: { x: 0, y: 0, w: 1, h: 1 },
  });

  layout.push({
    id: generateId(),
    moduleId: 'core',
    widgetId: 'cash-flow',
    size: 'S',
    position: { x: 1, y: 0, w: 1, h: 1 },
  });

  layout.push({
    id: generateId(),
    moduleId: 'core',
    widgetId: 'recent-transactions',
    size: 'M',
    position: { x: 0, y: 1, w: 2, h: 1 },
  });

  // Character-specific widgets
  if (characterId === 'planner' && activeModuleIds.includes('envelope')) {
    // The Planner: Focus on envelope budgets
    layout.push({
      id: generateId(),
      moduleId: 'envelope',
      widgetId: 'envelope-overview',
      size: 'M',
      position: { x: 0, y: 2, w: 2, h: 1 },
    });

    layout.push({
      id: generateId(),
      moduleId: 'envelope',
      widgetId: 'low-balance-warnings',
      size: 'S',
      position: { x: 2, y: 0, w: 1, h: 1 },
    });

    layout.push({
      id: generateId(),
      moduleId: 'core',
      widgetId: 'spending-by-category',
      size: 'M',
      position: { x: 0, y: 3, w: 2, h: 1 },
    });
  } else if (characterId === 'saver' && activeModuleIds.includes('goals')) {
    // The Saver: Focus on goals
    layout.push({
      id: generateId(),
      moduleId: 'goals',
      widgetId: 'goal-progress',
      size: 'M',
      position: { x: 0, y: 2, w: 2, h: 1 },
    });

    layout.push({
      id: generateId(),
      moduleId: 'goals',
      widgetId: 'projected-dates',
      size: 'S',
      position: { x: 2, y: 0, w: 1, h: 1 },
    });

    layout.push({
      id: generateId(),
      moduleId: 'goals',
      widgetId: 'savings-rate',
      size: 'M',
      position: { x: 0, y: 3, w: 2, h: 1 },
    });
  } else {
    // The Observer or default: Focus on statistics
    layout.push({
      id: generateId(),
      moduleId: 'core',
      widgetId: 'accounts-overview',
      size: 'M',
      position: { x: 0, y: 2, w: 2, h: 1 },
    });

    layout.push({
      id: generateId(),
      moduleId: 'core',
      widgetId: 'income-vs-expenses',
      size: 'M',
      position: { x: 0, y: 3, w: 2, h: 1 },
    });

    layout.push({
      id: generateId(),
      moduleId: 'core',
      widgetId: 'spending-by-category',
      size: 'M',
      position: { x: 0, y: 4, w: 2, h: 1 },
    });
  }

  return layout;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [profile, activeModuleIds] = await Promise.all([
    getUserProfile(user.id),
    getUserActiveModules(user.id),
  ]);

  const character = profile?.characterId ? CHARACTERS[profile.characterId] : null;
  const characterName = character?.name || 'there';

  // Get all available widgets from active modules
  const availableWidgets = getActiveWidgets(activeModuleIds);

  // Get default layout for this character
  const defaultLayout = getDefaultLayout(profile?.characterId || null, activeModuleIds);

  // Get smart nudges
  const nudges = await getUserNudges(user.id, activeModuleIds);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </div>

        {/* Smart Nudges Banner */}
        {nudges.length > 0 && <NudgeBanner nudges={nudges} />}

        <DashboardGrid
          availableWidgets={availableWidgets}
          defaultLayout={defaultLayout}
          characterName={characterName}
        />
      </div>
    </div>
  );
}
