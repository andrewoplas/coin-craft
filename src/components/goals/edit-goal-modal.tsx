'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEditGoalStore } from '@/stores/edit-goal-store';
import { updateGoal, pauseGoal, abandonGoal } from '@/server/actions/goals';
import { fromCentavos, formatPHP } from '@/lib/format';
import { toast } from 'sonner';
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

type EditGoalModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditGoalModal({ open, onOpenChange }: EditGoalModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);

  // Get state and actions from store
  const goalId = useEditGoalStore((state) => state.goalId);
  const currentAmount = useEditGoalStore((state) => state.currentAmount);
  const name = useEditGoalStore((state) => state.name);
  const icon = useEditGoalStore((state) => state.icon);
  const color = useEditGoalStore((state) => state.color);
  const targetAmount = useEditGoalStore((state) => state.targetAmount);
  const deadline = useEditGoalStore((state) => state.deadline);

  const setName = useEditGoalStore((state) => state.setName);
  const setIcon = useEditGoalStore((state) => state.setIcon);
  const setColor = useEditGoalStore((state) => state.setColor);
  const setTargetAmount = useEditGoalStore((state) => state.setTargetAmount);
  const setDeadline = useEditGoalStore((state) => state.setDeadline);
  const reset = useEditGoalStore((state) => state.reset);

  const handleSave = async () => {
    if (!goalId) return;

    // Validate required fields
    if (!name.trim()) {
      toast.error('Please enter a goal name');
      return;
    }

    // Validate target amount (from centavos to pesos)
    const amountInPesos = fromCentavos(targetAmount);
    if (amountInPesos <= 0) {
      toast.error('Please enter a valid target amount greater than 0');
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateGoal({
        goalId,
        name: name.trim(),
        icon: icon || undefined,
        color: color || undefined,
        targetAmount: amountInPesos,
        deadline: deadline || null,
      });

      if (result.success) {
        toast.success('Goal updated');
        reset();
        onOpenChange(false);
      } else {
        toast.error('Failed to update goal', {
          description: result.error || 'An unexpected error occurred.',
        });
      }
    } catch (error) {
      toast.error('Failed to update goal', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePause = async () => {
    if (!goalId) return;

    setIsPausing(true);

    try {
      const result = await pauseGoal({ goalId });

      if (result.success) {
        toast.success('Goal paused', {
          description: 'You can resume this goal later from your archived goals.',
        });
        reset();
        onOpenChange(false);
      } else {
        toast.error('Failed to pause goal', {
          description: result.error || 'An unexpected error occurred.',
        });
      }
    } catch (error) {
      toast.error('Failed to pause goal', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsPausing(false);
    }
  };

  const handleAbandon = async () => {
    if (!goalId) return;

    setIsAbandoning(true);

    try {
      const result = await abandonGoal({ goalId });

      if (result.success) {
        toast.success('Goal abandoned', {
          description: 'The goal has been removed from your active goals.',
        });
        reset();
        onOpenChange(false);
      } else {
        toast.error('Failed to abandon goal', {
          description: result.error || 'An unexpected error occurred.',
        });
      }
    } catch (error) {
      toast.error('Failed to abandon goal', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsAbandoning(false);
    }
  };

  const handleClose = () => {
    if (!isSaving && !isPausing && !isAbandoning) {
      reset();
      onOpenChange(false);
    }
  };

  const percentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
          <DialogDescription>
            Update your goal details or manage its status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Current Progress</span>
              <span className="text-sm font-medium text-gray-900">{percentage.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
            <div className="text-center">
              <span className="text-lg font-bold text-green-600">{formatPHP(currentAmount)}</span>
              <span className="text-gray-500"> saved</span>
            </div>
          </div>

          {/* Goal Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-goal-name">
              Goal Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-goal-name"
              placeholder="e.g., New iPhone, Vacation to Japan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Emoji and Color Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-goal-icon">Icon</Label>
              <Input
                id="edit-goal-icon"
                placeholder="🎯"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-goal-color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-goal-color"
                  type="color"
                  value={color || '#10B981'}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={color || ''}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#10B981"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Target Amount */}
          <div className="space-y-2">
            <Label htmlFor="edit-target-amount">
              Target Amount <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
              <Input
                id="edit-target-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={fromCentavos(targetAmount)}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setTargetAmount(Math.round(value * 100));
                }}
                className="pl-8"
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="edit-goal-deadline">
              Target Date (Optional)
            </Label>
            <Input
              id="edit-goal-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          {/* Danger Zone */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500 mb-3">Goal Management</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePause}
                disabled={isPausing || isSaving || isAbandoning}
              >
                {isPausing ? 'Pausing...' : 'Pause Goal'}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isPausing || isSaving || isAbandoning}
                  >
                    Abandon Goal
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Abandon this goal?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mark the goal as abandoned. You&apos;ve saved {formatPHP(currentAmount)} towards this goal. Are you sure you want to give up on it?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Going</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleAbandon}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isAbandoning ? 'Abandoning...' : 'Yes, Abandon'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSaving || isPausing || isAbandoning}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isPausing || isAbandoning}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
