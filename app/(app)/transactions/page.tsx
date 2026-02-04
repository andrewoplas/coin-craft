import { createClient } from '@/lib/supabase/server';
import { getUserTransactionsPaginated } from '@/server/queries/transactions';
import { TransactionList } from '@/components/transactions/transaction-list';
import { TransactionsEmptyState } from '@/components/transactions/transactions-empty-state';

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch initial page of transactions
  const { transactions: initialTransactions, hasMore, nextCursor } =
    await getUserTransactionsPaginated(user.id, { limit: 50 });

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Transactions</h1>

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
