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
import { useEditCategoryStore } from '@/stores/edit-category-store';
import { updateCategory } from '@/server/actions/categories';
import { toast } from 'sonner';
import type { CategoryType } from '@/lib/types';

type EditCategoryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Category type labels and icons for display
const CATEGORY_TYPE_DISPLAY: Record<CategoryType, { icon: string; label: string }> = {
  expense: { icon: '💸', label: 'Expense' },
  income: { icon: '💰', label: 'Income' },
};

export function EditCategoryModal({ open, onOpenChange }: EditCategoryModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Get state and actions from store
  const categoryId = useEditCategoryStore((state) => state.categoryId);
  const type = useEditCategoryStore((state) => state.type);
  const parentId = useEditCategoryStore((state) => state.parentId);
  const parentName = useEditCategoryStore((state) => state.parentName);
  const name = useEditCategoryStore((state) => state.name);
  const icon = useEditCategoryStore((state) => state.icon);
  const color = useEditCategoryStore((state) => state.color);

  const setName = useEditCategoryStore((state) => state.setName);
  const setIcon = useEditCategoryStore((state) => state.setIcon);
  const setColor = useEditCategoryStore((state) => state.setColor);
  const reset = useEditCategoryStore((state) => state.reset);

  const handleSave = async () => {
    // Validate required fields
    if (!name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    if (!categoryId) {
      toast.error('No category selected');
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateCategory({
        categoryId,
        name: name.trim(),
        icon: icon || undefined,
        color: color || undefined,
      });

      if (!result.success) {
        toast.error('Failed to update category', {
          description: result.error || 'An unexpected error occurred.',
        });
        return;
      }

      toast.success('Category updated', {
        description: `${name} has been updated.`,
      });

      // Reset form and close modal
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update category', {
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
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update category name, icon, or color. Type and parent category cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Read-only Category Type */}
          <div className="space-y-2">
            <Label>Category Type</Label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
              <span className="text-lg">{CATEGORY_TYPE_DISPLAY[type].icon}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {CATEGORY_TYPE_DISPLAY[type].label}
              </span>
              <span className="ml-auto text-xs text-gray-500">
                (Cannot be changed)
              </span>
            </div>
          </div>

          {/* Read-only Parent Category (if subcategory) */}
          {parentId && parentName && (
            <div className="space-y-2">
              <Label>Parent Category</Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {parentName}
                </span>
                <span className="ml-auto text-xs text-gray-500">
                  (Cannot be changed)
                </span>
              </div>
            </div>
          )}

          {/* Category Name (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="edit-category-name">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-category-name"
              placeholder="e.g., Food, Transport, Salary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Icon (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="edit-category-icon">Icon (Optional)</Label>
            <Input
              id="edit-category-icon"
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
            <Label htmlFor="edit-category-color">Color (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="edit-category-color"
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
