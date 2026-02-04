'use client';

import { useEffect, useState } from 'react';
import { type WidgetProps } from '@/modules/types';
import { Flame, Trophy } from 'lucide-react';

type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null;
};

export function StreakWidget({ size }: WidgetProps) {
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/dashboard/streak');
        if (response.ok) {
          const streakData = await response.json();
          setData(streakData);
        }
      } catch (error) {
        console.error('Failed to load streak:', error);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const currentStreak = data?.currentStreak || 0;
  const longestStreak = data?.longestStreak || 0;

  // Determine streak status and color
  const getStreakColor = (streak: number) => {
    if (streak >= 100) return 'text-yellow-500'; // Legendary gold
    if (streak >= 30) return 'text-orange-500'; // Strong
    if (streak >= 7) return 'text-orange-400'; // Building
    if (streak > 0) return 'text-orange-300'; // Starting
    return 'text-muted-foreground'; // No streak
  };

  // Get milestone badge
  const getMilestoneBadge = (streak: number) => {
    if (streak >= 100) return { text: 'Legendary', color: 'bg-yellow-500/20 text-yellow-600' };
    if (streak >= 30) return { text: 'On Fire', color: 'bg-orange-500/20 text-orange-600' };
    if (streak >= 7) return { text: 'Building', color: 'bg-orange-400/20 text-orange-500' };
    return null;
  };

  const milestoneBadge = getMilestoneBadge(currentStreak);

  // Small size - compact view
  if (size === 'S') {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <div className="flex items-center gap-2">
          <Flame className={`h-6 w-6 ${getStreakColor(currentStreak)}`} />
          <span className={`text-3xl font-bold ${getStreakColor(currentStreak)}`}>
            {currentStreak}
          </span>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {currentStreak === 1 ? 'day' : 'days'}
        </span>
      </div>
    );
  }

  // Medium and Large size - more details
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Flame className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">Logging Streak</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-bold ${getStreakColor(currentStreak)}`}>
          {currentStreak}
        </span>
        <span className="text-lg text-muted-foreground">
          {currentStreak === 1 ? 'day' : 'days'}
        </span>
      </div>

      {milestoneBadge && (
        <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-xs font-medium rounded-full w-fit ${milestoneBadge.color}`}>
          {currentStreak >= 100 && <Trophy className="h-3 w-3" />}
          {milestoneBadge.text}
        </span>
      )}

      {size === 'L' && longestStreak > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Best Streak</span>
            <span className="font-medium">{longestStreak} days</span>
          </div>
          {currentStreak > 0 && currentStreak >= longestStreak && (
            <p className="text-xs text-green-600 mt-1">You&apos;re at your best!</p>
          )}
        </div>
      )}
    </div>
  );
}
