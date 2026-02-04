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
import { useAddAccountStore } from '@/stores/add-account-store';
import { createAccount } from '@/server/actions/accounts';
import { toast } from 'sonner';
import type { AccountType } from '@/lib/types';

type AddAccountModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Default icons and colors by account type
const ACCOUNT_TYPE_DEFAULTS: Record<AccountType, { icon: string; color: string; label: string }> = {
  cash: { icon: '💵', color: '#10B981', label: 'Cash' },
  bank: { icon: '🏦', color: '#3B82F6', label: 'Bank Account' },
  e_wallet: { icon: '📱', color: '#8B5CF6', label: 'E-Wallet' },
  credit_card: { icon: '💳', color: '#EF4444', label: 'Credit Card' },
};

export function AddAccountModal({ open, onOpenChange }: AddAccountModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Get state and actions from store
  const name = useAddAccountStore((state) => state.name);
  const type = useAddAccountStore((state) => state.type);
  const icon = useAddAccountStore((state) => state.icon);
  const color = useAddAccountStore((state) => state.color);
  const initialBalance = useAddAccountStore((state) => state.initialBalance);

  const setName = useAddAccountStore((state) => state.setName);
  const setType = useAddAccountStore((state) => state.setType);
  const setIcon = useAddAccountStore((state) => state.setIcon);
  const setColor = useAddAccountStore((state) => state.setColor);
  const setInitialBalance = useAddAccountStore((state) => state.setInitialBalance);
  const reset = useAddAccountStore((state) => state.reset);

  // Get default icon and color for selected type
  const defaultIcon = ACCOUNT_TYPE_DEFAULTS[type].icon;
  const defaultColor = ACCOUNT_TYPE_DEFAULTS[type].color;

  const handleSave = async () => {
    // Validate required fields
    if (!name.trim()) {
      toast.error('Please enter an account name');
      return;
    }

    if (!type) {
      toast.error('Please select an account type');
      return;
    }

    // Validate initial balance
    const balanceValue = parseFloat(initialBalance);
    if (isNaN(balanceValue)) {
      toast.error('Please enter a valid initial balance');
      return;
    }

    setIsSaving(true);

    try {
      // Call createAccount server action
      const result = await createAccount({
        name: name.trim(),
        type,
        icon: icon || defaultIcon,
        color: color || defaultColor,
        initialBalance: balanceValue, // Server action will convert to centavos
      });

      if (!result.success) {
        toast.error('Failed to create account', {
          description: result.error || 'An unexpected error occurred.',
        });
        return;
      }

      toast.success('Account created', {
        description: `${name} has been added to your accounts.`,
      });

      // Reset form and close modal
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create account', {
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
          <DialogTitle>Add Account</DialogTitle>
          <DialogDescription>
            Create a new account to track your money.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="account-name">
              Account Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="account-name"
              placeholder="e.g., Main Wallet, Savings, Credit Card"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label htmlFor="account-type">
              Account Type <span className="text-red-500">*</span>
            </Label>
            <Select value={type} onValueChange={(value) => setType(value as AccountType)}>
              <SelectTrigger id="account-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ACCOUNT_TYPE_DEFAULTS) as AccountType[]).map((accountType) => (
                  <SelectItem key={accountType} value={accountType}>
                    <div className="flex items-center gap-2">
                      <span>{ACCOUNT_TYPE_DEFAULTS[accountType].icon}</span>
                      <span>{ACCOUNT_TYPE_DEFAULTS[accountType].label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Initial Balance */}
          <div className="space-y-2">
            <Label htmlFor="initial-balance">Initial Balance</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
              <Input
                id="initial-balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-gray-500">
              Enter the current balance of this account (optional, defaults to ₱0.00)
            </p>
          </div>

          {/* Icon (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="account-icon">Icon (Optional)</Label>
            <Input
              id="account-icon"
              placeholder={`Default: ${defaultIcon}`}
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={2}
            />
            <p className="text-xs text-gray-500">
              Enter an emoji or leave blank to use default
            </p>
          </div>

          {/* Color (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="account-color">Color (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="account-color"
                type="color"
                value={color || defaultColor}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                placeholder={`Default: ${defaultColor}`}
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500">
              Pick a color or leave blank to use default
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
            {isSaving ? 'Creating...' : 'Create Account'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
