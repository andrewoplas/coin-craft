'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { type WidgetProps } from '@/modules/types';
import { fetchActiveGoals } from '@/server/actions/allocations';
import { fromCentavos } from '@/lib/format';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Goal = {
  id: string;
  name: string;
  icon: string | null;
  currentAmount: number;
  targetAmount: number | null;
};

export function SavingsRateWidget({ size }: WidgetProps) {
  const [stats, setStats] = useState<{
    totalSaved: number;
    totalTarget: number;
    monthlyRate: number;
    trend: 'up' | 'down' | 'flat';
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const result = await fetchActiveGoals();
      if (result.success && result.data.length > 0) {
        const goals = result.data as Goal[];
        const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
        const totalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);

        // Estimate monthly rate (assuming 3 months of savings on average)
        const monthlyRate = Math.round(totalSaved / 3);

        // For now, we'll show a flat trend (would need historical data for real trend)
        const trend: 'up' | 'down' | 'flat' = totalSaved > 0 ? 'up' : 'flat';

        setStats({ totalSaved, totalTarget, monthlyRate, trend });
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!stats || stats.totalTarget === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <TrendingUp className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No savings data yet</p>
        <Link
          href="/modules/goals"
          className="text-sm text-primary hover:underline mt-1"
        >
          Start a goal
        </Link>
      </div>
    );
  }

  const overallProgress = (stats.totalSaved / stats.totalTarget) * 100;

  const TrendIcon = stats.trend === 'up'
    ? TrendingUp
    : stats.trend === 'down'
    ? TrendingDown
    : Minus;

  const trendColor = stats.trend === 'up'
    ? 'text-green-600'
    : stats.trend === 'down'
    ? 'text-red-600'
    : 'text-gray-500';

  return (
    <div className="space-y-4">
      {/* Total saved */}
      <div>
        <p className="text-sm text-muted-foreground mb-1">Total Saved</p>
        <p className="text-2xl font-bold text-green-600">
          ₱{fromCentavos(stats.totalSaved).toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          of ₱{fromCentavos(stats.totalTarget).toLocaleString()} target ({overallProgress.toFixed(0)}%)
        </p>
      </div>

      {/* Monthly rate */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div>
          <p className="text-sm text-muted-foreground">Monthly Avg</p>
          <p className="text-lg font-semibold">
            ₱{fromCentavos(stats.monthlyRate).toLocaleString()}
          </p>
        </div>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon className="h-5 w-5" />
          <span className="text-sm font-medium">
            {stats.trend === 'up' ? 'Growing' : stats.trend === 'down' ? 'Declining' : 'Steady'}
          </span>
        </div>
      </div>

      {/* Overall progress bar */}
      <div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${Math.min(100, overallProgress)}%` }}
          />
        </div>
      </div>

      <Link
        href="/modules/goals"
        className="block text-center text-sm text-primary hover:underline"
      >
        View all goals
      </Link>
    </div>
  );
}
