import { createClient } from '@/lib/supabase/server';
import { getUserTransactionsPaginated } from '@/server/queries/transactions';

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

        <div className="bg-white rounded-lg shadow">
          {initialTransactions.length === 0 ? (
            <div className="p-6">
              <p className="text-gray-500 text-center py-8">
                No transactions yet. Add your first transaction to get started!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {initialTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {transaction.category.icon || '📝'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.category.name}
                        </p>
                        {transaction.note && (
                          <p className="text-sm text-gray-500">
                            {transaction.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'expense'
                          ? 'text-red-600'
                          : transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-indigo-600'
                      }`}>
                        {transaction.type === 'expense' ? '-' : '+'}₱
                        {(transaction.amount / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.account.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
