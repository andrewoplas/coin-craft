'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoalDetail, MonthlySavingsStats } from '@/server/queries/goals';
import { formatPHP, fromCentavos } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Plus, Calendar, TrendingUp, Target, CheckCircle2 } from 'lucide-react';
import { differenceInDays, parseISO, format, addMonths, differenceInMonths } from 'date-fns';
import { contributeToGoal, completeGoal } from '@/server/actions/goals';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

type GoalDetailClientProps = {
  goal: GoalDetail;
  stats: MonthlySavingsStats;
};

export function GoalDetailClient({ goal, stats }: GoalDetailClientProps) {
  const router = useRouter();
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [contributeAmount, setContributeAmount] = useState('');
  const [isContributing, setIsContributing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const targetAmount = goal.targetAmount || 0;
  const currentAmount = goal.currentAmount;
  const remaining = Math.max(0, targetAmount - currentAmount);
  const percentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const isComplete = percentage >= 100;

  // Calculate on-track status
  const getOnTrackStatus = () => {
    if (!goal.deadline || isComplete) return null;

    const deadlineDate = parseISO(goal.deadline);
    const daysRemaining = differenceInDays(deadlineDate, new Date());

    if (daysRemaining < 0) {
      return { status: 'overdue', label: 'Overdue', color: 'text-red-600 bg-red-50' };
    }

    if (stats.requiredMonthlySavings && stats.averageMonthlySavings > 0) {
      const isOnTrack = stats.averageMonthlySavings >= stats.requiredMonthlySavings * 0.9;
      return isOnTrack
        ? { status: 'on-track', label: 'On Track', color: 'text-green-600 bg-green-50' }
        : { status: 'off-track', label: 'Off Track', color: 'text-amber-600 bg-amber-50' };
    }

    return null;
  };

  const trackStatus = getOnTrackStatus();

  // Calculate projected completion date
  const getProjectedDate = () => {
    if (isComplete) return 'Completed!';
    if (stats.projectedMonthsToGoal === null) return 'Start saving to see projection';
    if (stats.projectedMonthsToGoal === 0) return 'Completed!';

    const projectedDate = addMonths(new Date(), stats.projectedMonthsToGoal);
    return format(projectedDate, 'MMMM yyyy');
  };

  const handleContribute = async () => {
    const amount = parseFloat(contributeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsContributing(true);

    try {
      const result = await contributeToGoal({
        goalId: goal.id,
        amount,
      });

      if (result.success) {
        toast.success('Contribution added!', {
          description: `₱${amount.toFixed(2)} has been added to ${goal.name}.`,
        });
        setContributeAmount('');
        setIsContributeOpen(false);
        router.refresh();
      } else {
        toast.error('Failed to add contribution', {
          description: result.error || 'An unexpected error occurred.',
        });
      }
    } catch (error) {
      toast.error('Failed to add contribution', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsContributing(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);

    try {
      const result = await completeGoal({ goalId: goal.id });

      if (result.success) {
        // Trigger celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        toast.success('Goal completed!', {
          description: `Congratulations on reaching ${goal.name}! 🎉`,
        });

        setTimeout(() => {
          router.push('/modules/goals');
        }, 2000);
      } else {
        toast.error('Failed to complete goal', {
          description: result.error || 'An unexpected error occurred.',
        });
      }
    } catch (error) {
      toast.error('Failed to complete goal', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/modules/goals')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Goals
        </Button>

        {isComplete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Mark as Complete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Complete this goal? 🎉</AlertDialogTitle>
                <AlertDialogDescription>
                  Congratulations on reaching your goal of {formatPHP(targetAmount)} for &quot;{goal.name}&quot;!
                  Marking it complete will archive this goal.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Not yet</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleComplete}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isCompleting}
                >
                  {isCompleting ? 'Completing...' : 'Yes, Celebrate!'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Goal header card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: goal.color ? `${goal.color}20` : '#e5e7eb' }}
          >
            {goal.icon || '🎯'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{goal.name}</h1>
              {trackStatus && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${trackStatus.color}`}>
                  {trackStatus.label}
                </span>
              )}
            </div>
            {goal.deadline && (
              <div className="flex items-center gap-1 mt-1 text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Target: {format(parseISO(goal.deadline), 'MMMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Amount and Progress */}
        <div className="mb-6">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-bold text-green-600">{formatPHP(currentAmount)}</span>
            <span className="text-xl text-gray-500">of {formatPHP(targetAmount)}</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                isComplete ? 'bg-green-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{percentage.toFixed(1)}% complete</span>
            <span>{formatPHP(remaining)} to go</span>
          </div>
        </div>

        {/* Contribute button */}
        {!isComplete && (
          <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-green-600 hover:bg-green-700 gap-2">
                <Plus className="h-4 w-4" />
                Add Contribution
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contribute to {goal.name}</DialogTitle>
                <DialogDescription>
                  Add savings towards this goal. Current progress: {formatPHP(currentAmount)} / {formatPHP(targetAmount)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="contribute-amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                    <Input
                      id="contribute-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={contributeAmount}
                      onChange={(e) => setContributeAmount(e.target.value)}
                      className="pl-8"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setContributeAmount(fromCentavos(remaining).toString())}
                  >
                    Complete ({formatPHP(remaining)})
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsContributeOpen(false)}
                  disabled={isContributing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleContribute}
                  disabled={isContributing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isContributing ? 'Adding...' : 'Add Contribution'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Monthly Average</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatPHP(stats.averageMonthlySavings)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">This Month</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatPHP(stats.currentMonthSavings)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Target className="h-4 w-4" />
            <span className="text-sm">Projected Completion</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {getProjectedDate()}
          </p>
        </div>
      </div>

      {/* Required savings if deadline */}
      {goal.deadline && stats.requiredMonthlySavings && !isComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            To reach your goal by {format(parseISO(goal.deadline), 'MMMM d, yyyy')},
            you need to save <strong>{formatPHP(stats.requiredMonthlySavings)}</strong> per month.
            {stats.averageMonthlySavings >= (stats.requiredMonthlySavings * 0.9)
              ? ' You\'re on track! 🎉'
              : ' Consider increasing your monthly savings.'}
          </p>
        </div>
      )}
    </div>
  );
}
