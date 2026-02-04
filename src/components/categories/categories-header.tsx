'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function CategoriesHeader() {
  const handleAddCategory = () => {
    // TODO: Open Add Category modal (Sprint 6 task 2)
    console.log('Add category clicked');
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
