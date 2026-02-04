'use client';

import { useMemo } from 'react';
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
import { X, CalendarIcon } from 'lucide-react';
import type { CategoryType } from '@/lib/types';
import { CategoryPicker } from './category-picker';
import type { CategoryWithSubcategories, Category } from '@/server/queries/categories';
import type { Account } from '@/server/queries/accounts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { formatDateString } from '@/lib/format';
import { useQuickAddStore } from '@/stores/quick-add-store';
import { getActiveFormExtensions } from '@/modules/registry';

type QuickAddModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryWithSubcategories[];
  accounts: Account[];
  activeModules: string[];
};

export function QuickAddModal({ open, onOpenChange, categories, accounts, activeModules }: QuickAddModalProps) {
  // Get state and actions from Zustand store
  const amount = useQuickAddStore((state) => state.amount);
  const transactionType = useQuickAddStore((state) => state.transactionType);
  const selectedCategory = useQuickAddStore((state) => state.selectedCategory);
  const selectedAccountId = useQuickAddStore((state) => state.selectedAccountId);
  const selectedDate = useQuickAddStore((state) => state.selectedDate);
  const note = useQuickAddStore((state) => state.note);
  const categoryPickerOpen = useQuickAddStore((state) => state.categoryPickerOpen);
  const datePickerOpen = useQuickAddStore((state) => state.datePickerOpen);

  const setAmount = useQuickAddStore((state) => state.setAmount);
  const setTransactionType = useQuickAddStore((state) => state.setTransactionType);
  const setSelectedCategory = useQuickAddStore((state) => state.setSelectedCategory);
  const setSelectedAccountId = useQuickAddStore((state) => state.setSelectedAccountId);
  const setSelectedDate = useQuickAddStore((state) => state.setSelectedDate);
  const setNote = useQuickAddStore((state) => state.setNote);
  const setCategoryPickerOpen = useQuickAddStore((state) => state.setCategoryPickerOpen);
  const setDatePickerOpen = useQuickAddStore((state) => state.setDatePickerOpen);
  const formExtensionValues = useQuickAddStore((state) => state.formExtensionValues);
  const setFormExtensionValue = useQuickAddStore((state) => state.setFormExtensionValue);

  // Get form extensions from active modules
  const allExtensions = useMemo(() => {
    return getActiveFormExtensions(activeModules);
  }, [activeModules]);

  // Filter extensions by transaction type
  const filteredExtensions = useMemo(() => {
    return allExtensions.filter((ext) =>
      ext.transactionTypes.includes(transactionType)
    );
  }, [allExtensions, transactionType]);

  // Helper to get extensions for a specific position
  const getExtensionsForPosition = (position: 'after-category' | 'after-account' | 'before-save') => {
    return filteredExtensions.filter((ext) => ext.position === position);
  };

  // Filter categories by transaction type
  const filteredCategories = useMemo(() => {
    // For transfer type, we don't show categories
    if (transactionType === 'transfer') {
      return [];
    }

    // Filter by transaction type (expense or income)
    const categoryType: CategoryType = transactionType as CategoryType;
    return categories.filter(cat => cat.type === categoryType);
  }, [categories, transactionType]);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

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

          {/* Transaction Type Toggle */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={transactionType === 'expense' ? 'default' : 'outline'}
                className={`flex-1 ${
                  transactionType === 'expense'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : ''
                }`}
                onClick={() => setTransactionType('expense')}
              >
                Expense
              </Button>
              <Button
                type="button"
                variant={transactionType === 'income' ? 'default' : 'outline'}
                className={`flex-1 ${
                  transactionType === 'income'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : ''
                }`}
                onClick={() => setTransactionType('income')}
              >
                Income
              </Button>
              <Button
                type="button"
                variant={transactionType === 'transfer' ? 'default' : 'outline'}
                className={`flex-1 ${
                  transactionType === 'transfer'
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                    : ''
                }`}
                onClick={() => setTransactionType('transfer')}
              >
                Transfer
              </Button>
            </div>
          </div>

          {/* Category Picker - Only show for expense/income, not transfer */}
          {transactionType !== 'transfer' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => setCategoryPickerOpen(true)}
              >
                {selectedCategory ? (
                  <>
                    <span className="text-2xl mr-3">{selectedCategory.icon || '📦'}</span>
                    <span className="text-base">{selectedCategory.name}</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl mr-3">🏪</span>
                    <span className="text-base">Select category...</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Module Form Extensions - after-category position */}
          {getExtensionsForPosition('after-category').map((ext) => {
            const ExtensionComponent = ext.component;
            return (
              <div key={ext.id} className="space-y-2">
                <Label className="text-sm font-medium">{ext.label}</Label>
                <ExtensionComponent
                  value={formExtensionValues[ext.id]}
                  onChange={(value) => setFormExtensionValue(ext.id, value)}
                  transactionType={transactionType}
                />
              </div>
            );
          })}

          {/* Account Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Account</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="w-full h-auto py-3">
                <SelectValue placeholder="Select account...">
                  {selectedAccountId && (() => {
                    const selectedAccount = accounts.find(a => a.id === selectedAccountId);
                    return selectedAccount ? (
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{selectedAccount.icon || '💳'}</span>
                        <span className="text-base">{selectedAccount.name}</span>
                      </div>
                    ) : null;
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{account.icon || '💳'}</span>
                      <div className="flex flex-col">
                        <span className="text-base font-medium">{account.name}</span>
                        <span className="text-xs text-gray-500 capitalize">{account.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Module Form Extensions - after-account position */}
          {getExtensionsForPosition('after-account').map((ext) => {
            const ExtensionComponent = ext.component;
            return (
              <div key={ext.id} className="space-y-2">
                <Label className="text-sm font-medium">{ext.label}</Label>
                <ExtensionComponent
                  value={formExtensionValues[ext.id]}
                  onChange={(value) => setFormExtensionValue(ext.id, value)}
                  transactionType={transactionType}
                />
              </div>
            );
          })}

          {/* Date Picker */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-gray-500" />
                  <span className="text-base">
                    {formatDateString(selectedDate, 'MMM d, yyyy')}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(selectedDate)}
                  onSelect={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      setSelectedDate(`${year}-${month}-${day}`);
                      setDatePickerOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Note Field */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium">
              Note (optional)
            </Label>
            <Input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full"
            />
          </div>

          {/* Module Form Extensions - before-save position */}
          {getExtensionsForPosition('before-save').map((ext) => {
            const ExtensionComponent = ext.component;
            return (
              <div key={ext.id} className="space-y-2">
                <Label className="text-sm font-medium">{ext.label}</Label>
                <ExtensionComponent
                  value={formExtensionValues[ext.id]}
                  onChange={(value) => setFormExtensionValue(ext.id, value)}
                  transactionType={transactionType}
                />
              </div>
            );
          })}
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

      {/* Category Picker Dialog */}
      <CategoryPicker
        open={categoryPickerOpen}
        onOpenChange={setCategoryPickerOpen}
        categories={filteredCategories}
        onSelect={handleCategorySelect}
      />
    </Dialog>
  );
}
