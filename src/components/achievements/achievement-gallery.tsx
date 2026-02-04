'use client';

import { format } from 'date-fns';
import { Lock, Trophy } from 'lucide-react';

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: string;
  earned: boolean;
  earnedAt?: Date;
};

type AchievementGalleryProps = {
  achievements: Achievement[];
};

export function AchievementGallery({ achievements }: AchievementGalleryProps) {
  // Group achievements by category
  const categories = achievements.reduce(
    (acc, achievement) => {
      const cat = achievement.category;
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(achievement);
      return acc;
    },
    {} as Record<string, Achievement[]>
  );

  // Category display names
  const categoryNames: Record<string, string> = {
    streak: 'Streak Achievements',
    savings: 'Savings Achievements',
    budget: 'Budget Achievements',
    milestone: 'Milestone Achievements',
  };

  return (
    <div className="space-y-8">
      {Object.entries(categories).map(([category, categoryAchievements]) => (
        <div key={category}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            {categoryNames[category] || category}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { earned, icon, name, description, requirement, earnedAt } = achievement;

  return (
    <div
      className={`
        relative rounded-xl border-2 p-4 transition-all
        ${
          earned
            ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-md'
            : 'border-gray-200 bg-gray-50 opacity-60'
        }
      `}
    >
      {/* Icon */}
      <div className="flex items-start gap-3">
        <div
          className={`
            text-4xl flex-shrink-0
            ${earned ? '' : 'grayscale opacity-50'}
          `}
        >
          {earned ? icon : '❓'}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3
            className={`
              font-semibold truncate
              ${earned ? 'text-gray-900' : 'text-gray-500'}
            `}
          >
            {earned ? name : '???'}
          </h3>

          {/* Description */}
          <p
            className={`
              text-sm mt-1
              ${earned ? 'text-gray-600' : 'text-gray-400'}
            `}
          >
            {earned ? description : requirement}
          </p>

          {/* Earned date */}
          {earned && earnedAt && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
              Earned {format(new Date(earnedAt), 'MMM d, yyyy')}
            </p>
          )}
        </div>
      </div>

      {/* Lock icon for locked achievements */}
      {!earned && (
        <div className="absolute top-2 right-2">
          <Lock className="h-4 w-4 text-gray-400" />
        </div>
      )}
    </div>
  );
}
