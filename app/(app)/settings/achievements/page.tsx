import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAchievementsWithStatus } from '@/server/queries/achievements';
import { AchievementGallery } from '@/components/achievements/achievement-gallery';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function AchievementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const achievements = await getAchievementsWithStatus(user.id);

  // Count earned achievements
  const earnedCount = achievements.filter((a) => a.earned).length;
  const totalCount = achievements.length;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/settings"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
            <p className="text-gray-500 mt-1">
              {earnedCount} of {totalCount} unlocked
            </p>
          </div>
        </div>

        <AchievementGallery achievements={achievements} />
      </div>
    </div>
  );
}
