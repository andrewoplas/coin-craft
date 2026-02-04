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
import { useEditEnvelopeStore } from '@/stores/edit-envelope-store';
import { toast } from 'sonner';
import { fromCentavos, formatPHP } from '@/lib/format';
import { updateEnvelope } from '@/server/actions/envelopes';

type EditEnvelopeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditEnvelopeModal({ open, onOpenChange }: EditEnvelopeModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Get state and actions from store
  const envelopeId = useEditEnvelopeStore((state) => state.envelopeId);
  const currentAmount = useEditEnvelopeStore((state) => state.currentAmount);
  const periodStart = useEditEnvelopeStore((state) => state.periodStart);
  const name = useEditEnvelopeStore((state) => state.name);
  const icon = useEditEnvelopeStore((state) => state.icon);
  const color = useEditEnvelopeStore((state) => state.color);
  const targetAmount = useEditEnvelopeStore((state) => state.targetAmount);
  const period = useEditEnvelopeStore((state) => state.period);
  const rolloverEnabled = useEditEnvelopeStore((state) => state.rolloverEnabled);

  const setName = useEditEnvelopeStore((state) => state.setName);
  const setIcon = useEditEnvelopeStore((state) => state.setIcon);
  const setColor = useEditEnvelopeStore((state) => state.setColor);
  const setTargetAmount = useEditEnvelopeStore((state) => state.setTargetAmount);
  const setPeriod = useEditEnvelopeStore((state) => state.setPeriod);
  const setRolloverEnabled = useEditEnvelopeStore((state) => state.setRolloverEnabled);
  const reset = useEditEnvelopeStore((state) => state.reset);

  // Convert centavos to pesos for display
  const targetAmountInPesos = fromCentavos(targetAmount).toString();
  const currentAmountDisplay = formatPHP(currentAmount);

  const handleSave = async () => {
    // Validate required fields
    if (!name.trim()) {
      toast.error('Please enter an envelope name');
      return;
    }

    if (!envelopeId) {
      toast.error('No envelope selected');
      return;
    }

    // Parse and validate target amount
    const parsedAmount = parseFloat(targetAmountInPesos.replace(/[^0-9.-]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid target amount greater than 0');
      return;
    }

    if (!period) {
      toast.error('Please select a period');
      return;
    }

    setIsSaving(true);

    try {
      // Call updateEnvelope server action
      const result = await updateEnvelope({
        envelopeId,
        name: name.trim(),
        icon: icon || undefined,
        color: color || undefined,
        targetAmount: parsedAmount,
        period: period as 'weekly' | 'monthly',
        rolloverEnabled,
      });

      if (!result.success) {
        toast.error('Failed to update envelope', {
          description: result.error || 'An unexpected error occurred.',
        });
        return;
      }

      toast.success('Envelope updated', {
        description: `${name} has been updated.`,
      });

      // Reset form and close modal
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update envelope', {
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

  // Handle target amount input change
  const handleTargetAmountChange = (value: string) => {
    // Parse the input to get a number (remove non-numeric characters except decimal point)
    const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (!isNaN(numericValue)) {
      // Convert pesos to centavos and store
      setTargetAmount(Math.round(numericValue * 100));
    } else if (value === '') {
      setTargetAmount(0);
    }
  };

  // Dynamic label based on period
  const getTargetLabel = () => {
    if (period === 'weekly') return 'Weekly Budget';
    if (period === 'monthly') return 'Monthly Budget';
    return 'Target Amount';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Envelope</DialogTitle>
          <DialogDescription>
            Update envelope name, icon, budget amount, or period settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Read-only Current Amount */}
          <div className="space-y-2">
            <Label>Current Spent</Label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
              <span className="text-sm font-medium">{currentAmountDisplay}</span>
              <span className="ml-auto text-xs text-gray-500">(Current period)</span>
            </div>
          </div>

          {/* Read-only Period Start */}
          {periodStart && (
            <div className="space-y-2">
              <Label>Period Started</Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(periodStart).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          {/* Envelope Name (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="edit-envelope-name">
              Envelope Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-envelope-name"
              placeholder="e.g., Groceries, Entertainment, Rent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Icon (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="edit-envelope-icon">Icon (Optional)</Label>
            <Input
              id="edit-envelope-icon"
              placeholder="Enter an emoji"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={2}
            />
            <p className="text-xs text-gray-500">Enter an emoji or leave blank to keep default</p>
          </div>

          {/* Color (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="edit-envelope-color">Color (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="edit-envelope-color"
                type="color"
                value={color || '#3B82F6'}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                placeholder="Hex color code"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500">Pick a color or leave blank to keep default</p>
          </div>

          {/* Target Amount (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="edit-envelope-target">
              {getTargetLabel()} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-envelope-target"
              type="number"
              placeholder="0.00"
              value={targetAmountInPesos.replace(/[^0-9.-]/g, '')}
              onChange={(e) => handleTargetAmountChange(e.target.value)}
              step="0.01"
              min="0"
            />
            <p className="text-xs text-gray-500">Amount in Philippine Pesos (₱)</p>
          </div>

          {/* Period (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="edit-envelope-period">
              Period <span className="text-red-500">*</span>
            </Label>
            <Select value={period} onValueChange={(val) => setPeriod(val as 'weekly' | 'monthly')}>
              <SelectTrigger id="edit-envelope-period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rollover Toggle (Editable) */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="edit-envelope-rollover">Rollover Unused Budget</Label>
              <p className="text-sm text-gray-500">
                Carry over unspent budget to next period
              </p>
            </div>
            <Switch
              id="edit-envelope-rollover"
              checked={rolloverEnabled}
              onCheckedChange={setRolloverEnabled}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
