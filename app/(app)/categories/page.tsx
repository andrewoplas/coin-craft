import { createClient } from '@/lib/supabase/server';
import { getUserCategories } from '@/server/queries/categories';
import { CategoriesPageClient } from '@/components/categories/categories-page-client';

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
        <CategoriesPageClient
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
        />
      </div>
    </div>
  );
}
