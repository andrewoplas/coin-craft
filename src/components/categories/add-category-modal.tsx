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
import { createCategory } from '@/server/actions/categories';
import { useAddCategoryStore } from '@/stores/add-category-store';
import { toast } from 'sonner';
import type { CategoryType } from '@/lib/types';
import type { CategoryWithSubcategories } from '@/server/queries/categories';

type AddCategoryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseCategories: CategoryWithSubcategories[];
  incomeCategories: CategoryWithSubcategories[];
};

// Default icons and colors by category type
const CATEGORY_TYPE_DEFAULTS: Record<CategoryType, { icon: string; color: string; label: string }> = {
  expense: { icon: '💸', color: '#EF4444', label: 'Expense' },
  income: { icon: '💰', color: '#10B981', label: 'Income' },
};

export function AddCategoryModal({
  open,
  onOpenChange,
  expenseCategories,
  incomeCategories,
}: AddCategoryModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Get state and actions from store
  const name = useAddCategoryStore((state) => state.name);
  const type = useAddCategoryStore((state) => state.type);
  const icon = useAddCategoryStore((state) => state.icon);
  const color = useAddCategoryStore((state) => state.color);
  const parentId = useAddCategoryStore((state) => state.parentId);

  const setName = useAddCategoryStore((state) => state.setName);
  const setType = useAddCategoryStore((state) => state.setType);
  const setIcon = useAddCategoryStore((state) => state.setIcon);
  const setColor = useAddCategoryStore((state) => state.setColor);
  const setParentId = useAddCategoryStore((state) => state.setParentId);
  const reset = useAddCategoryStore((state) => state.reset);

  // Get default icon and color for selected type
  const defaultIcon = CATEGORY_TYPE_DEFAULTS[type].icon;
  const defaultColor = CATEGORY_TYPE_DEFAULTS[type].color;

  // Get available parent categories based on selected type
  const availableParentCategories = type === 'expense' ? expenseCategories : incomeCategories;

  const handleSave = async () => {
    // Validate required fields
    if (!name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    if (!type) {
      toast.error('Please select a category type');
      return;
    }

    setIsSaving(true);

    try {
      // Call server action to create category
      const result = await createCategory({
        name: name.trim(),
        type,
        icon: icon || defaultIcon,
        color: color || defaultColor,
        parentId,
      });

      if (!result.success) {
        toast.error('Failed to create category', {
          description: result.error || 'An unexpected error occurred.',
        });
        return;
      }

      toast.success('Category created', {
        description: `${name} has been added to your categories.`,
      });

      // Reset form and close modal
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create category', {
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

  const handleTypeChange = (newType: CategoryType) => {
    setType(newType);
    // Reset parent when type changes (parent must match type)
    setParentId(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>
            Create a new category to organize your transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="category-name">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="category-name"
              placeholder="e.g., Food, Transport, Salary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Category Type */}
          <div className="space-y-2">
            <Label htmlFor="category-type">
              Category Type <span className="text-red-500">*</span>
            </Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger id="category-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CATEGORY_TYPE_DEFAULTS) as CategoryType[]).map((categoryType) => (
                  <SelectItem key={categoryType} value={categoryType}>
                    <div className="flex items-center gap-2">
                      <span>{CATEGORY_TYPE_DEFAULTS[categoryType].icon}</span>
                      <span>{CATEGORY_TYPE_DEFAULTS[categoryType].label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Parent Category (Optional - for subcategories) */}
          <div className="space-y-2">
            <Label htmlFor="parent-category">Parent Category (Optional)</Label>
            <Select
              value={parentId || 'none'}
              onValueChange={(value) => setParentId(value === 'none' ? null : value)}
            >
              <SelectTrigger id="parent-category">
                <SelectValue placeholder="None (main category)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (main category)</SelectItem>
                {availableParentCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <span>{cat.icon || defaultIcon}</span>
                      <span>{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Select a parent to create a subcategory, or leave as None to create a main category
            </p>
          </div>

          {/* Icon (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="category-icon">Icon (Optional)</Label>
            <Input
              id="category-icon"
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
            <Label htmlFor="category-color">Color (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="category-color"
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
            {isSaving ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
