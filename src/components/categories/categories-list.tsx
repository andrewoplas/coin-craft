'use client';

import type { CategoryWithSubcategories } from '@/server/queries/categories';
import type { CategoryType } from '@/lib/types';
import { Button } from '@/components/ui/button';

type CategoriesListProps = {
  categories: CategoryWithSubcategories[];
  type: CategoryType;
};

export function CategoriesList({ categories, type }: CategoriesListProps) {
  const handleAddCategory = () => {
    // TODO: Open Add Category modal (Sprint 6 task 2)
    console.log('Add category clicked for type:', type);
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          {/* Illustration - emoji placeholder */}
          <div className="text-8xl mb-6">
            {type === 'expense' ? '💸' : '💰'}
          </div>

          {/* Heading */}
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No {type} categories yet
          </h3>

          {/* Subtext */}
          <p className="text-gray-600 mb-8">
            Add your first {type} category to start organizing your transactions
          </p>

          {/* CTA Button */}
          <Button
            onClick={handleAddCategory}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
          >
            Add Your First {type === 'expense' ? 'Expense' : 'Income'} Category
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="divide-y divide-gray-200">
        {categories.map((category) => (
          <div key={category.id} className="p-4">
            {/* Main Category */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category.icon || '📁'}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                {category.subcategories.length > 0 && (
                  <p className="text-sm text-gray-500">
                    {category.subcategories.length} {category.subcategories.length === 1 ? 'subcategory' : 'subcategories'}
                  </p>
                )}
              </div>
              {category.color && (
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: category.color }}
                />
              )}
            </div>

            {/* Subcategories */}
            {category.subcategories.length > 0 && (
              <div className="ml-11 mt-3 space-y-2">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{subcategory.icon || '📄'}</span>
                    <span className="text-gray-700">{subcategory.name}</span>
                    {subcategory.color && (
                      <div
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: subcategory.color }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
