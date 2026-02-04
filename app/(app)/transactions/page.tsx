import { createClient } from '@/lib/supabase/server';
import {
  getUserTransactionsPaginated,
  type TransactionFilters,
} from '@/server/queries/transactions';
import { getUserCategories } from '@/server/queries/categories';
import { getUserAccounts } from '@/server/queries/accounts';
import { InfiniteTransactionList } from '@/components/transactions/infinite-transaction-list';
import { TransactionsEmptyState } from '@/components/transactions/transactions-empty-state';
import { FilterBar } from '@/components/transactions/filter-bar';
import type { TransactionType } from '@/lib/types';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Extract filter values from URL searchParams
  const params = await searchParams;
  const filters: TransactionFilters = {
    type:
      params.type && params.type !== 'all'
        ? (params.type as TransactionType)
        : undefined,
    accountId: params.account ? String(params.account) : undefined,
    categoryId: params.category ? String(params.category) : undefined,
    dateFrom: params.dateFrom ? String(params.dateFrom) : undefined,
    dateTo: params.dateTo ? String(params.dateTo) : undefined,
    note: params.search ? String(params.search) : undefined,
  };

  // Fetch initial page of transactions with filters
  const { transactions: initialTransactions, hasMore, nextCursor } =
    await getUserTransactionsPaginated(user.id, { limit: 50, filters });

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
          <InfiniteTransactionList
            initialTransactions={initialTransactions}
            initialHasMore={hasMore}
            initialNextCursor={nextCursor}
            filters={{
              type: params.type ? String(params.type) : undefined,
              accountId: params.account ? String(params.account) : undefined,
              categoryId: params.category ? String(params.category) : undefined,
              dateFrom: params.dateFrom ? String(params.dateFrom) : undefined,
              dateTo: params.dateTo ? String(params.dateTo) : undefined,
              note: params.search ? String(params.search) : undefined,
            }}
          />
        )}
      </div>
    </div>
  );
}
