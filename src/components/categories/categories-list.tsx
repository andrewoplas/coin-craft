'use client';

import type { CategoryWithSubcategories } from '@/server/queries/categories';
import type { CategoryType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useEditCategoryStore } from '@/stores/edit-category-store';
import { Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { DeleteCategoryDialog } from './delete-category-dialog';
import { HideCategoryDialog } from './hide-category-dialog';

type CategoriesListProps = {
  categories: CategoryWithSubcategories[];
  type: CategoryType;
};

export function CategoriesList({ categories, type }: CategoriesListProps) {
  const openForEdit = useEditCategoryStore((state) => state.openForEdit);

  const handleAddCategory = () => {
    // TODO: Open Add Category modal (Sprint 6 task 2)
    console.log('Add category clicked for type:', type);
  };

  const handleEditCategory = (category: CategoryWithSubcategories) => {
    openForEdit(category);
  };

  const handleEditSubcategory = (
    subcategory: CategoryWithSubcategories['subcategories'][number],
    parentName: string
  ) => {
    openForEdit(subcategory, parentName);
  };

  const handleMoveUp = async (
    categoryId: string,
    currentIndex: number,
    isSubcategory: boolean = false
  ) => {
    if (currentIndex === 0) return;

    // TODO: Call reorderCategories server action (Sprint 6 next task)
    console.log('Move up:', categoryId, 'from index', currentIndex);
  };

  const handleMoveDown = async (
    categoryId: string,
    currentIndex: number,
    totalCount: number,
    isSubcategory: boolean = false
  ) => {
    if (currentIndex === totalCount - 1) return;

    // TODO: Call reorderCategories server action (Sprint 6 next task)
    console.log('Move down:', categoryId, 'from index', currentIndex);
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
        {categories.map((category, categoryIndex) => (
          <div key={category.id} className="p-4">
            {/* Main Category */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category.icon || '📁'}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {category.subcategories.length > 0 && (
                    <span>
                      {category.subcategories.length} {category.subcategories.length === 1 ? 'subcategory' : 'subcategories'}
                    </span>
                  )}
                  {category.subcategories.length > 0 && category.transactionCount !== undefined && category.transactionCount > 0 && (
                    <span>•</span>
                  )}
                  {category.transactionCount !== undefined && category.transactionCount > 0 && (
                    <span>
                      {category.transactionCount} {category.transactionCount === 1 ? 'transaction' : 'transactions'}
                    </span>
                  )}
                </div>
              </div>
              {category.color && (
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: category.color }}
                />
              )}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveUp(category.id, categoryIndex)}
                  disabled={categoryIndex === 0}
                  className="hover:bg-gray-100"
                >
                  <ChevronUp className="h-4 w-4 text-gray-600" />
                  <span className="sr-only">Move up {category.name}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveDown(category.id, categoryIndex, categories.length)}
                  disabled={categoryIndex === categories.length - 1}
                  className="hover:bg-gray-100"
                >
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                  <span className="sr-only">Move down {category.name}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditCategory(category)}
                  className="hover:bg-gray-100"
                >
                  <Pencil className="h-4 w-4 text-gray-600" />
                  <span className="sr-only">Edit {category.name}</span>
                </Button>
                {category.isSystem ? (
                  <HideCategoryDialog
                    categoryId={category.id}
                    categoryName={category.name}
                    categoryIcon={category.icon}
                    type={type}
                  />
                ) : (
                  <DeleteCategoryDialog
                    categoryId={category.id}
                    categoryName={category.name}
                    categoryIcon={category.icon}
                    type={type}
                  />
                )}
              </div>
            </div>

            {/* Subcategories */}
            {category.subcategories.length > 0 && (
              <div className="ml-11 mt-3 space-y-2">
                {category.subcategories.map((subcategory, subcategoryIndex) => (
                  <div key={subcategory.id} className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{subcategory.icon || '📄'}</span>
                    <div className="flex-1">
                      <span className="text-gray-700">{subcategory.name}</span>
                      {subcategory.transactionCount !== undefined && subcategory.transactionCount > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({subcategory.transactionCount} {subcategory.transactionCount === 1 ? 'transaction' : 'transactions'})
                        </span>
                      )}
                    </div>
                    {subcategory.color && (
                      <div
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: subcategory.color }}
                      />
                    )}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveUp(subcategory.id, subcategoryIndex, true)}
                        disabled={subcategoryIndex === 0}
                        className="hover:bg-gray-100 h-6 w-6"
                      >
                        <ChevronUp className="h-3 w-3 text-gray-600" />
                        <span className="sr-only">Move up {subcategory.name}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveDown(subcategory.id, subcategoryIndex, category.subcategories.length, true)}
                        disabled={subcategoryIndex === category.subcategories.length - 1}
                        className="hover:bg-gray-100 h-6 w-6"
                      >
                        <ChevronDown className="h-3 w-3 text-gray-600" />
                        <span className="sr-only">Move down {subcategory.name}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditSubcategory(subcategory, category.name)}
                        className="hover:bg-gray-100 h-6 w-6"
                      >
                        <Pencil className="h-3 w-3 text-gray-600" />
                        <span className="sr-only">Edit {subcategory.name}</span>
                      </Button>
                      {subcategory.isSystem ? (
                        <HideCategoryDialog
                          categoryId={subcategory.id}
                          categoryName={subcategory.name}
                          categoryIcon={subcategory.icon}
                          type={type}
                          small
                        />
                      ) : (
                        <DeleteCategoryDialog
                          categoryId={subcategory.id}
                          categoryName={subcategory.name}
                          categoryIcon={subcategory.icon}
                          type={type}
                          small
                        />
                      )}
                    </div>
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
