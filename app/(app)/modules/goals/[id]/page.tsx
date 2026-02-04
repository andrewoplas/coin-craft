import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getGoalById, getGoalContributions, getGoalSavingsStats } from '@/server/queries/goals';
import { GoalDetailClient } from '@/components/goals/goal-detail-client';
import { GoalContributionsList } from '@/components/goals/goal-contributions-list';
import { SavingsProgressChart } from '@/components/goals/savings-progress-chart';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function GoalDetailPage({ params }: PageProps) {
  // Get authenticated user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Await params (Next.js 15 async params)
  const { id } = await params;

  // Fetch goal details
  const goal = await getGoalById(id, user.id);

  if (!goal) {
    notFound();
  }

  // Fetch contributions and stats
  const contributions = await getGoalContributions(id, user.id);
  const stats = await getGoalSavingsStats(id, user.id, goal);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <GoalDetailClient goal={goal} stats={stats} />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Progress chart */}
        <div className="lg:col-span-1">
          <SavingsProgressChart contributions={contributions} goal={goal} />
        </div>

        {/* Contributions list */}
        <div className="lg:col-span-1">
          <GoalContributionsList contributions={contributions} />
        </div>
      </div>
    </div>
  );
}
