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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAddEnvelopeStore } from '@/stores/add-envelope-store';
import { createEnvelope } from '@/server/actions/envelopes';
import { toast } from 'sonner';

type AddEnvelopeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PERIOD_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

export function AddEnvelopeModal({ open, onOpenChange }: AddEnvelopeModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Get state and actions from store
  const name = useAddEnvelopeStore((state) => state.name);
  const emoji = useAddEnvelopeStore((state) => state.emoji);
  const targetAmount = useAddEnvelopeStore((state) => state.targetAmount);
  const period = useAddEnvelopeStore((state) => state.period);
  const rolloverEnabled = useAddEnvelopeStore((state) => state.rolloverEnabled);

  const setName = useAddEnvelopeStore((state) => state.setName);
  const setEmoji = useAddEnvelopeStore((state) => state.setEmoji);
  const setTargetAmount = useAddEnvelopeStore((state) => state.setTargetAmount);
  const setPeriod = useAddEnvelopeStore((state) => state.setPeriod);
  const setRolloverEnabled = useAddEnvelopeStore((state) => state.setRolloverEnabled);
  const reset = useAddEnvelopeStore((state) => state.reset);

  const handleSave = async () => {
    // Validate required fields
    if (!name.trim()) {
      toast.error('Please enter an envelope name');
      return;
    }

    // Validate target amount
    const amountValue = parseFloat(targetAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    if (!period) {
      toast.error('Please select a period');
      return;
    }

    setIsSaving(true);

    try {
      // Call createEnvelope server action
      const result = await createEnvelope({
        name: name.trim(),
        emoji: emoji || '💰',
        targetAmount: amountValue,
        period,
        rolloverEnabled,
      });

      if (result.success) {
        toast.success('Envelope created', {
          description: `${name} has been added to your envelopes.`,
        });

        // Reset form and close modal
        reset();
        onOpenChange(false);
      } else {
        toast.error('Failed to create envelope', {
          description: result.error || 'An unexpected error occurred.',
        });
      }
    } catch (error) {
      toast.error('Failed to create envelope', {
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
          <DialogTitle>Add Envelope</DialogTitle>
          <DialogDescription>
            Create a new budget envelope to track your spending.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Envelope Name */}
          <div className="space-y-2">
            <Label htmlFor="envelope-name">
              Envelope Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="envelope-name"
              placeholder="e.g., Groceries, Entertainment, Transport"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Emoji */}
          <div className="space-y-2">
            <Label htmlFor="envelope-emoji">Emoji (Optional)</Label>
            <Input
              id="envelope-emoji"
              placeholder="💰"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={2}
            />
            <p className="text-xs text-gray-500">
              Enter an emoji or leave blank for default (💰)
            </p>
          </div>

          {/* Target Amount */}
          <div className="space-y-2">
            <Label htmlFor="target-amount">
              {period === 'monthly' ? 'Monthly' : 'Weekly'} Allocation{' '}
              <span className="text-red-500">*</span>
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
              How much can you spend from this envelope each {period === 'monthly' ? 'month' : 'week'}?
            </p>
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="envelope-period">
              Period <span className="text-red-500">*</span>
            </Label>
            <Select value={period} onValueChange={(value) => setPeriod(value as 'weekly' | 'monthly')}>
              <SelectTrigger id="envelope-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              How often should this envelope reset?
            </p>
          </div>

          {/* Rollover Toggle */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="rollover-toggle" className="cursor-pointer">
                Rollover unused amount
              </Label>
              <p className="text-xs text-gray-500">
                Carry over leftover budget to next {period === 'monthly' ? 'month' : 'week'}
              </p>
            </div>
            <Switch
              id="rollover-toggle"
              checked={rolloverEnabled}
              onCheckedChange={setRolloverEnabled}
            />
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
          >
            {isSaving ? 'Creating...' : 'Create Envelope'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
