'use client';

import { useEffect, useState } from 'react';
import { type FormExtensionProps } from '@/modules/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchActiveGoals } from '@/server/actions/allocations';
import { fromCentavos } from '@/lib/format';

type Goal = {
  id: string;
  name: string;
  icon: string | null;
  currentAmount: number;
  targetAmount: number | null;
  deadline: string | null;
};

export function GoalPicker({ value, onChange, transactionType }: FormExtensionProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch goals on mount
    async function loadGoals() {
      try {
        const result = await fetchActiveGoals();

        if (result.success) {
          setGoals(result.data);
        } else {
          console.error('Failed to fetch goals:', result.error);
        }
      } catch (error) {
        console.error('Failed to fetch goals:', error);
      } finally {
        setLoading(false);
      }
    }

    loadGoals();
  }, []);

  // Only show for income transactions
  if (transactionType !== 'income') {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Allocate to goal?</label>
        <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-500">Allocate to goal?</label>
        <p className="text-sm text-gray-400">No goals available. Create one in Goals.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="goal-picker" className="text-sm font-medium">
        Allocate to goal?
      </label>
      <Select value={value as string | undefined} onValueChange={onChange}>
        <SelectTrigger id="goal-picker">
          <SelectValue placeholder="Select a goal..." />
        </SelectTrigger>
        <SelectContent>
          {goals.map((goal) => {
            const current = fromCentavos(goal.currentAmount);
            const target = goal.targetAmount ? fromCentavos(goal.targetAmount) : null;
            const percentage = target && target > 0 ? Math.round((current / target) * 100) : 0;

            return (
              <SelectItem key={goal.id} value={goal.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {goal.icon && <span>{goal.icon}</span>}
                    <span>{goal.name}</span>
                  </div>
                  {target !== null && (
                    <span className="text-xs text-gray-500">
                      ₱{current.toFixed(2)} of ₱{target.toFixed(2)} ({percentage}%)
                    </span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
