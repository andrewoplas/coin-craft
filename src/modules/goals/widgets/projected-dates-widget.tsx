'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { type WidgetProps } from '@/modules/types';
import { fetchActiveGoals } from '@/server/actions/allocations';
import { fromCentavos } from '@/lib/format';
import { CalendarClock, Target } from 'lucide-react';
import { addMonths, format, differenceInMonths } from 'date-fns';

type Goal = {
  id: string;
  name: string;
  icon: string | null;
  currentAmount: number;
  targetAmount: number | null;
  deadline: string | null;
  createdAt?: Date;
};

type ProjectedGoal = Goal & {
  projectedDate: string | null;
  isComplete: boolean;
};

export function ProjectedDatesWidget({ size }: WidgetProps) {
  const [goals, setGoals] = useState<ProjectedGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGoals() {
      const result = await fetchActiveGoals();
      if (result.success) {
        // Calculate projected dates for each goal
        const now = new Date();
        const projected: ProjectedGoal[] = result.data.map((goal: Goal) => {
          const target = goal.targetAmount || 0;
          const current = goal.currentAmount;
          const remaining = Math.max(0, target - current);
          const isComplete = remaining === 0;

          let projectedDate: string | null = null;

          if (isComplete) {
            projectedDate = 'Complete!';
          } else if (current > 0) {
            // Calculate monthly savings rate (assuming created recently if no createdAt)
            const monthsSinceStart = Math.max(1, 3); // Assume 3 months avg if unknown
            const monthlySavings = current / monthsSinceStart;

            if (monthlySavings > 0) {
              const monthsNeeded = Math.ceil(remaining / monthlySavings);
              const projected = addMonths(now, monthsNeeded);
              projectedDate = format(projected, 'MMM yyyy');
            }
          }

          return {
            ...goal,
            projectedDate,
            isComplete,
          };
        });

        setGoals(projected);
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
        <CalendarClock className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No goals to track</p>
        <Link
          href="/modules/goals"
          className="text-sm text-primary hover:underline mt-1"
        >
          Create a goal
        </Link>
      </div>
    );
  }

  // Determine how many to show based on size
  const maxItems = size === 'S' ? 3 : size === 'M' ? 5 : 8;
  const displayGoals = goals.slice(0, maxItems);

  return (
    <div className="space-y-2">
      {displayGoals.map((goal) => {
        const remaining = Math.max(0, (goal.targetAmount || 0) - goal.currentAmount);

        return (
          <Link
            key={goal.id}
            href={`/modules/goals/${goal.id}`}
            className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg flex-shrink-0">{goal.icon || '🎯'}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{goal.name}</p>
                {!goal.isComplete && (
                  <p className="text-xs text-muted-foreground">
                    ₱{fromCentavos(remaining).toLocaleString()} to go
                  </p>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              {goal.projectedDate ? (
                <span
                  className={`text-sm font-medium ${
                    goal.isComplete ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                >
                  {goal.projectedDate}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Start saving
                </span>
              )}
            </div>
          </Link>
        );
      })}
      {goals.length > maxItems && (
        <Link
          href="/modules/goals"
          className="block text-center text-sm text-primary hover:underline pt-2"
        >
          View all goals
        </Link>
      )}
    </div>
  );
}
