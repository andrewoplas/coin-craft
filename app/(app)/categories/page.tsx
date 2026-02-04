import { createClient } from '@/lib/supabase/server';
import { getUserCategories } from '@/server/queries/categories';
import { CategoriesHeader } from '@/components/categories/categories-header';
import { CategoriesList } from '@/components/categories/categories-list';

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch expense and income categories separately
  const expenseCategories = await getUserCategories(user.id, 'expense');
  const incomeCategories = await getUserCategories(user.id, 'income');

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
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
      </div>
    </div>
  );
}
