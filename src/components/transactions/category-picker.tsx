'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { CategoryWithSubcategories, Category } from '@/server/queries/categories';

type CategoryPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryWithSubcategories[];
  onSelect: (category: Category) => void;
};

export function CategoryPicker({
  open,
  onOpenChange,
  categories,
  onSelect,
}: CategoryPickerProps) {
  const [selectedMain, setSelectedMain] = useState<CategoryWithSubcategories | null>(null);

  const handleMainCategoryClick = (mainCategory: CategoryWithSubcategories) => {
    // If main category has no subcategories, select it directly
    if (mainCategory.subcategories.length === 0) {
      onSelect(mainCategory);
      onOpenChange(false);
      setSelectedMain(null);
    } else {
      // Show subcategories
      setSelectedMain(mainCategory);
    }
  };

  const handleSubcategoryClick = (subcategory: Category) => {
    onSelect(subcategory);
    onOpenChange(false);
    setSelectedMain(null);
  };

  const handleBack = () => {
    setSelectedMain(null);
  };

  const handleDialogClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setSelectedMain(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {selectedMain && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>
              {selectedMain ? selectedMain.name : 'Select Category'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-4">
          {!selectedMain ? (
            // Main categories grid
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleMainCategoryClick(category)}
                  className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all"
                  style={{
                    borderColor: category.color || undefined,
                  }}
                >
                  <span className="text-3xl mb-2">{category.icon || '📦'}</span>
                  <span className="text-xs font-medium text-center line-clamp-2">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            // Subcategories list
            <div className="grid grid-cols-1 gap-2">
              {selectedMain.subcategories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => handleSubcategoryClick(subcategory)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all text-left"
                >
                  <span className="text-2xl">{subcategory.icon || selectedMain.icon || '📦'}</span>
                  <span className="text-sm font-medium">{subcategory.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
