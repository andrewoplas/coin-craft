'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAddCategoryStore } from '@/stores/add-category-store';

export function CategoriesHeader() {
  const open = useAddCategoryStore((state) => state.open);

  const handleAddCategory = () => {
    open(); // Open modal with default type (expense)
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
      <Button onClick={handleAddCategory}>
        <Plus className="h-4 w-4 mr-2" />
        Add Category
      </Button>
    </div>
  );
}
