'use client';

import { CategoriesHeader } from './categories-header';
import { CategoriesList } from './categories-list';
import { AddCategoryModal } from './add-category-modal';
import { EditCategoryModal } from './edit-category-modal';
import { useAddCategoryStore } from '@/stores/add-category-store';
import { useEditCategoryStore } from '@/stores/edit-category-store';
import type { CategoryWithSubcategories } from '@/server/queries/categories';

type CategoriesPageClientProps = {
  expenseCategories: CategoryWithSubcategories[];
  incomeCategories: CategoryWithSubcategories[];
};

export function CategoriesPageClient({
  expenseCategories,
  incomeCategories,
}: CategoriesPageClientProps) {
  const isAddOpen = useAddCategoryStore((state) => state.isOpen);
  const closeAdd = useAddCategoryStore((state) => state.close);

  const isEditOpen = useEditCategoryStore((state) => state.isOpen);
  const closeEdit = useEditCategoryStore((state) => state.close);

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
        open={isAddOpen}
        onOpenChange={closeAdd}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        open={isEditOpen}
        onOpenChange={closeEdit}
      />
    </>
  );
}
