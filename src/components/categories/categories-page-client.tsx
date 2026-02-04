'use client';

import { CategoriesHeader } from './categories-header';
import { CategoriesList } from './categories-list';
import { AddCategoryModal } from './add-category-modal';
import { useAddCategoryStore } from '@/stores/add-category-store';
import type { CategoryWithSubcategories } from '@/server/queries/categories';

type CategoriesPageClientProps = {
  expenseCategories: CategoryWithSubcategories[];
  incomeCategories: CategoryWithSubcategories[];
};

export function CategoriesPageClient({
  expenseCategories,
  incomeCategories,
}: CategoriesPageClientProps) {
  const isOpen = useAddCategoryStore((state) => state.isOpen);
  const close = useAddCategoryStore((state) => state.close);

  return (
    <>
      <CategoriesHeader />

      {/* Expense Categories Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Expense Categories</h2>
        </div>
        <CategoriesList categories={expenseCategories} type="expense" />
      </div>

      {/* Income Categories Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Income Categories</h2>
        </div>
        <CategoriesList categories={incomeCategories} type="income" />
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        open={isOpen}
        onOpenChange={close}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
      />
    </>
  );
}
