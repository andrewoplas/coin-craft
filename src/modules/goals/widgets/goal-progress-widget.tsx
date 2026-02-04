'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { type WidgetProps } from '@/modules/types';
import { fetchActiveGoals } from '@/server/actions/allocations';
import { fromCentavos } from '@/lib/format';
import { Target } from 'lucide-react';

type Goal = {
  id: string;
  name: string;
  icon: string | null;
  currentAmount: number;
  targetAmount: number | null;
};

export function GoalProgressWidget({ size }: WidgetProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGoals() {
      const result = await fetchActiveGoals();
      if (result.success) {
        setGoals(result.data);
      }
      setLoading(false);
    }
    loadGoals();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <Target className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No goals yet</p>
        <Link
          href="/modules/goals"
          className="text-sm text-primary hover:underline mt-1"
        >
          Create your first goal
        </Link>
      </div>
    );
  }

  // Determine how many to show based on size
  const maxItems = size === 'S' ? 3 : size === 'M' ? 5 : 8;
  const displayGoals = goals.slice(0, maxItems);

  return (
    <div className="space-y-3">
      {displayGoals.map((goal) => {
        const target = goal.targetAmount || 0;
        const saved = goal.currentAmount;
        const percentage = target > 0 ? (saved / target) * 100 : 0;

        const getProgressColor = (percent: number) => {
          if (percent >= 100) return 'bg-green-500';
          if (percent >= 75) return 'bg-emerald-500';
          if (percent >= 50) return 'bg-teal-500';
          return 'bg-cyan-500';
        };

        return (
          <Link
            key={goal.id}
            href={`/modules/goals/${goal.id}`}
            className="block hover:bg-muted/50 rounded-lg p-2 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{goal.icon || '🎯'}</span>
                <span className="text-sm font-medium truncate">{goal.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {percentage.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getProgressColor(percentage)}`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>₱{fromCentavos(saved).toLocaleString()}</span>
              <span>₱{fromCentavos(target).toLocaleString()}</span>
            </div>
          </Link>
        );
      })}
      {goals.length > maxItems && (
        <Link
          href="/modules/goals"
          className="block text-center text-sm text-primary hover:underline"
        >
          View all {goals.length} goals
        </Link>
      )}
    </div>
  );
}
