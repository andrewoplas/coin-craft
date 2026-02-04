import { createClient } from '@/lib/supabase/server';
import { getActiveGoals } from '@/server/queries/allocations';
import { GoalsList } from '@/components/goals/goals-list';

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch active goals for this user
  const goals = await getActiveGoals(user.id);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <GoalsList goals={goals} />
      </div>
    </div>
  );
}
