import { createClient } from '@/lib/supabase/server';
import { getUserTransactionsPaginated } from '@/server/queries/transactions';
import { getUserCategories } from '@/server/queries/categories';
import { getUserAccounts } from '@/server/queries/accounts';
import { TransactionList } from '@/components/transactions/transaction-list';
import { TransactionsEmptyState } from '@/components/transactions/transactions-empty-state';
import { FilterBar } from '@/components/transactions/filter-bar';

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch initial page of transactions
  const { transactions: initialTransactions, hasMore, nextCursor } =
    await getUserTransactionsPaginated(user.id, { limit: 50 });

  // Fetch filter data
  const categories = await getUserCategories(user.id);
  const accounts = await getUserAccounts(user.id);

  // Flatten categories for filter dropdown (include subcategories)
  const flatCategories = categories.flatMap((cat) => [
    { id: cat.id, name: cat.name, icon: cat.icon },
    ...cat.subcategories.map((sub) => ({
      id: sub.id,
      name: sub.name,
      icon: sub.icon,
    })),
  ]);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Transactions</h1>

        <FilterBar categories={flatCategories} accounts={accounts} />

        {initialTransactions.length === 0 ? (
          <TransactionsEmptyState />
        ) : (
          <TransactionList transactions={initialTransactions} />
        )}

        {hasMore && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              More transactions available (pagination coming soon)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
