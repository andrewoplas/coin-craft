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
import { X } from 'lucide-react';

type QuickAddModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function QuickAddModal({ open, onOpenChange }: QuickAddModalProps) {
  const [amount, setAmount] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Quick Add</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Add a new transaction quickly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Input - Large display, auto-focused */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-400">
                ₱
              </span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-4xl font-bold h-20 pl-12 text-center"
                autoFocus
              />
            </div>
          </div>

          {/* Transaction Type Toggle - Placeholder */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Type</Label>
            <div className="flex gap-2">
              <Button variant="default" className="flex-1 bg-red-500 hover:bg-red-600">
                Expense
              </Button>
              <Button variant="outline" className="flex-1">
                Income
              </Button>
              <Button variant="outline" className="flex-1">
                Transfer
              </Button>
            </div>
          </div>

          {/* Category Picker - Placeholder */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
              <span className="text-2xl mr-3">🏪</span>
              <span className="text-base">Select category...</span>
            </Button>
          </div>

          {/* Account Selector - Placeholder */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Account</Label>
            <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
              <span className="text-2xl mr-3">💳</span>
              <span className="text-base">Select account...</span>
            </Button>
          </div>

          {/* Date Picker - Placeholder */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full"
            />
          </div>

          {/* Note Field - Placeholder */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium">
              Note (optional)
            </Label>
            <Input
              id="note"
              type="text"
              placeholder="Add a note..."
              className="w-full"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
            Save Transaction
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
