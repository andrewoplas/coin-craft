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
import { useAddGoalStore } from '@/stores/add-goal-store';
import { createGoal } from '@/server/actions/goals';
import { toast } from 'sonner';

type AddGoalModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddGoalModal({ open, onOpenChange }: AddGoalModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Get state and actions from store
  const name = useAddGoalStore((state) => state.name);
  const emoji = useAddGoalStore((state) => state.emoji);
  const color = useAddGoalStore((state) => state.color);
  const targetAmount = useAddGoalStore((state) => state.targetAmount);
  const deadline = useAddGoalStore((state) => state.deadline);

  const setName = useAddGoalStore((state) => state.setName);
  const setEmoji = useAddGoalStore((state) => state.setEmoji);
  const setColor = useAddGoalStore((state) => state.setColor);
  const setTargetAmount = useAddGoalStore((state) => state.setTargetAmount);
  const setDeadline = useAddGoalStore((state) => state.setDeadline);
  const reset = useAddGoalStore((state) => state.reset);

  const handleSave = async () => {
    // Validate required fields
    if (!name.trim()) {
      toast.error('Please enter a goal name');
      return;
    }

    // Validate target amount
    const amountValue = parseFloat(targetAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('Please enter a valid target amount greater than 0');
      return;
    }

    setIsSaving(true);

    try {
      const result = await createGoal({
        name: name.trim(),
        emoji: emoji || '🎯',
        color: color || undefined,
        targetAmount: amountValue,
        deadline: deadline || undefined,
      });

      if (result.success) {
        toast.success('Goal created!', {
          description: `${name} has been added. Start saving towards it!`,
        });

        // Reset form and close modal
        reset();
        onOpenChange(false);
      } else {
        toast.error('Failed to create goal', {
          description: result.error || 'An unexpected error occurred.',
        });
      }
    } catch (error) {
      toast.error('Failed to create goal', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a New Goal</DialogTitle>
          <DialogDescription>
            What are you saving for? Set a target and track your progress.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Goal Name */}
          <div className="space-y-2">
            <Label htmlFor="goal-name">
              Goal Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="goal-name"
              placeholder="e.g., New iPhone, Vacation to Japan, Emergency Fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Emoji and Color Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal-emoji">Icon (Optional)</Label>
              <Input
                id="goal-emoji"
                placeholder="🎯"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={2}
              />
              <p className="text-xs text-gray-500">
                Enter an emoji or leave blank for default
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-color">Color (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="goal-color"
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
            <Label htmlFor="target-amount">
              Target Amount <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
              <Input
                id="target-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-gray-500">
              How much do you need to save for this goal?
            </p>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="goal-deadline">
              Target Date (Optional)
            </Label>
            <Input
              id="goal-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500">
              When do you want to reach this goal? We&apos;ll help you track if you&apos;re on pace.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? 'Creating...' : 'Create Goal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
