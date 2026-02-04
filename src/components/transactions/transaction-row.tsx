'use client';

import type { TransactionWithRelations } from '@/server/queries/transactions';
import { Badge } from '@/components/ui/badge';
import { useQuickAddStore } from '@/stores/quick-add-store';

type TransactionRowProps = {
  transaction: TransactionWithRelations;
};

export function TransactionRow({ transaction }: TransactionRowProps) {
  const openWithTransaction = useQuickAddStore((state) => state.openWithTransaction);

  const handleClick = () => {
    openWithTransaction(transaction);
  };

  return (
    <div
      onClick={handleClick}
      className="p-4 hover:bg-gray-50 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{transaction.category.icon || '📝'}</div>
          <div>
            <p className="font-medium text-gray-900">
              {transaction.category.name}
            </p>
            {transaction.allocations.length > 0 && (
              <div className="flex gap-1 mt-1">
                {transaction.allocations.map((allocation) => (
                  <Badge
                    key={allocation.id}
                    className={
                      allocation.moduleType === 'envelope'
                        ? 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100'
                        : 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100'
                    }
                  >
                    {allocation.name}
                  </Badge>
                ))}
              </div>
            )}
            {transaction.note && (
              <p className="text-sm text-gray-500 line-clamp-1">
                {transaction.note}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p
            className={`font-semibold ${
              transaction.type === 'expense'
                ? 'text-red-600'
                : transaction.type === 'income'
                ? 'text-green-600'
                : 'text-indigo-600'
            }`}
          >
            {transaction.type === 'expense' ? '-' : '+'}₱
            {(transaction.amount / 100).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">{transaction.account.name}</p>
        </div>
      </div>
    </div>
  );
}
