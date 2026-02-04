"use client";

import { Goal } from '@/server/queries/allocations';
import { formatPHP, fromCentavos } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Pencil, Calendar, TrendingUp } from 'lucide-react';
import { differenceInDays, differenceInMonths, parseISO, format, addMonths } from 'date-fns';

type GoalCardProps = {
  goal: Goal;
  onClick?: () => void;
  onEdit?: () => void;
};

export const GoalCard = ({ goal, onClick, onEdit }: GoalCardProps) => {
  const targetAmount = goal.targetAmount || 0;
  const currentAmount = goal.currentAmount || 0;
  const remaining = Math.max(0, targetAmount - currentAmount);
  const percentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  // Calculate projected completion date based on savings rate
  const getProjectedDate = (): string | null => {
    if (percentage >= 100) return 'Completed!';
    if (currentAmount <= 0) return null;

    // Calculate average monthly savings based on goal creation date
    const createdDate = goal.createdAt;
    const monthsSinceCreation = Math.max(1, differenceInMonths(new Date(), createdDate));
    const monthlySavingsRate = currentAmount / monthsSinceCreation;

    if (monthlySavingsRate <= 0) return null;

    const monthsNeeded = Math.ceil(remaining / monthlySavingsRate);
    const projectedDate = addMonths(new Date(), monthsNeeded);

    return format(projectedDate, 'MMM yyyy');
  };

  // Calculate deadline status
  const getDeadlineStatus = (): { label: string; color: string; isOnTrack: boolean } | null => {
    if (!goal.deadline) return null;

    const deadlineDate = parseISO(goal.deadline);
    const daysRemaining = differenceInDays(deadlineDate, new Date());
    const monthsRemaining = Math.max(1, differenceInMonths(deadlineDate, new Date()));

    if (daysRemaining < 0) {
      return { label: 'Overdue', color: 'text-red-600', isOnTrack: false };
    }

    if (percentage >= 100) {
      return { label: 'Goal reached!', color: 'text-green-600', isOnTrack: true };
    }

    // Calculate required monthly savings to meet deadline
    const requiredMonthlySavings = remaining / monthsRemaining;

    // Calculate current monthly savings rate
    const monthsSinceCreation = Math.max(1, differenceInMonths(new Date(), goal.createdAt));
    const currentMonthlySavings = currentAmount / monthsSinceCreation;

    const isOnTrack = currentMonthlySavings >= requiredMonthlySavings * 0.9; // 90% threshold

    if (daysRemaining <= 30) {
      return {
        label: `${daysRemaining} days left`,
        color: isOnTrack ? 'text-amber-600' : 'text-red-600',
        isOnTrack
      };
    }

    return {
      label: format(deadlineDate, 'MMM d, yyyy'),
      color: isOnTrack ? 'text-gray-600' : 'text-amber-600',
      isOnTrack
    };
  };

  // Determine progress bar color based on completion
  const getProgressColor = (): string => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-emerald-500';
    if (percentage >= 50) return 'bg-teal-500';
    if (percentage >= 25) return 'bg-cyan-500';
    return 'bg-blue-500';
  };

  const projectedDate = getProjectedDate();
  const deadlineStatus = getDeadlineStatus();
  const progressColor = getProgressColor();

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header: Icon and Name */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
            style={{ backgroundColor: goal.color ? `${goal.color}20` : '#e5e7eb' }}
          >
            {goal.icon || '🎯'}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{goal.name}</h3>
            {deadlineStatus && (
              <div className="flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className={`text-sm ${deadlineStatus.color}`}>
                  {deadlineStatus.label}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Edit button */}
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={handleEdit} className="h-8 w-8 p-0">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit goal</span>
          </Button>
        )}
      </div>

      {/* Amount Display */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">
            {formatPHP(currentAmount)}
          </span>
          <span className="text-gray-500">
            / {formatPHP(targetAmount)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-semibold text-gray-900">
            {Math.min(100, percentage).toFixed(0)}%
          </span>
        </div>
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>

      {/* Projected/Remaining Info */}
      <div className="flex justify-between items-center text-sm">
        <div>
          <span className="text-gray-500">Remaining: </span>
          <span className="font-medium text-gray-900">{formatPHP(remaining)}</span>
        </div>
        {projectedDate && (
          <div className="flex items-center gap-1 text-gray-500">
            <TrendingUp className="w-4 h-4" />
            <span>Est. {projectedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};
