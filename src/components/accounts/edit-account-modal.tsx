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
import { useEditAccountStore } from '@/stores/edit-account-store';
import { toast } from 'sonner';
import { fromCentavos } from '@/lib/format';
import type { AccountType } from '@/lib/types';
import { updateAccount } from '@/server/actions/accounts';

type EditAccountModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Account type labels for display
const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  cash: 'Cash',
  bank: 'Bank Account',
  e_wallet: 'E-Wallet',
  credit_card: 'Credit Card',
};

export function EditAccountModal({ open, onOpenChange }: EditAccountModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Get state and actions from store
  const accountId = useEditAccountStore((state) => state.accountId);
  const accountType = useEditAccountStore((state) => state.accountType);
  const currentBalance = useEditAccountStore((state) => state.currentBalance);
  const name = useEditAccountStore((state) => state.name);
  const icon = useEditAccountStore((state) => state.icon);
  const color = useEditAccountStore((state) => state.color);

  const setName = useEditAccountStore((state) => state.setName);
  const setIcon = useEditAccountStore((state) => state.setIcon);
  const setColor = useEditAccountStore((state) => state.setColor);
  const reset = useEditAccountStore((state) => state.reset);

  const handleSave = async () => {
    // Validate required fields
    if (!name.trim()) {
      toast.error('Please enter an account name');
      return;
    }

    if (!accountId) {
      toast.error('No account selected');
      return;
    }

    setIsSaving(true);

    try {
      // Call updateAccount server action
      const result = await updateAccount({
        accountId,
        name: name.trim(),
        icon: icon || undefined,
        color: color || undefined,
      });

      if (!result.success) {
        toast.error('Failed to update account', {
          description: result.error || 'An unexpected error occurred.',
        });
        return;
      }

      toast.success('Account updated', {
        description: `${name} has been updated.`,
      });

      // Reset form and close modal
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update account', {
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
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Update account name, icon, or color. Type and initial balance cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Read-only Account Type */}
          <div className="space-y-2">
            <Label>Account Type</Label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {ACCOUNT_TYPE_LABELS[accountType as AccountType] || accountType}
              </span>
              <span className="ml-auto text-xs text-gray-500">
                (Cannot be changed)
              </span>
            </div>
          </div>

          {/* Read-only Current Balance */}
          <div className="space-y-2">
            <Label>Current Balance</Label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
              <span className="text-sm font-medium">
                {fromCentavos(currentBalance)}
              </span>
              <span className="ml-auto text-xs text-gray-500">
                (Computed from transactions)
              </span>
            </div>
          </div>

          {/* Account Name (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="edit-account-name">
              Account Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-account-name"
              placeholder="e.g., Main Wallet, Savings, Credit Card"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Icon (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="edit-account-icon">Icon (Optional)</Label>
            <Input
              id="edit-account-icon"
              placeholder="Enter an emoji"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={2}
            />
            <p className="text-xs text-gray-500">
              Enter an emoji or leave blank to keep default
            </p>
          </div>

          {/* Color (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="edit-account-color">Color (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="edit-account-color"
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
            <p className="text-xs text-gray-500">
              Pick a color or leave blank to keep default
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
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
