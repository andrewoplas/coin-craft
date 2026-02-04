'use client';

import type { TransactionWithRelations } from '@/server/queries/transactions';
import { Badge } from '@/components/ui/badge';
import { useQuickAddStore } from '@/stores/quick-add-store';
import { DeleteTransactionDialog } from './delete-transaction-dialog';

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
      className="p-4 hover:bg-muted/50 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{transaction.category.icon || '📝'}</div>
          <div>
            <p className="font-medium text-foreground">
              {transaction.category.name}
            </p>
            {transaction.allocations.length > 0 && (
              <div className="flex gap-1 mt-1">
                {transaction.allocations.map((allocation) => (
                  <Badge
                    key={allocation.id}
                    variant="outline"
                    className={
                      allocation.moduleType === 'envelope'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                        : 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                    }
                  >
                    {allocation.name}
                  </Badge>
                ))}
              </div>
            )}
            {transaction.note && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {transaction.note}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p
              className={`font-semibold ${
                transaction.type === 'expense'
                  ? 'text-red-600 dark:text-red-400'
                  : transaction.type === 'income'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {transaction.type === 'expense' ? '-' : '+'}₱
              {(transaction.amount / 100).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">{transaction.account.name}</p>
          </div>
          <DeleteTransactionDialog
            transactionId={transaction.id}
            transactionAmount={`${transaction.type === 'expense' ? '-' : '+'}₱${(transaction.amount / 100).toFixed(2)}`}
            categoryName={transaction.category.name}
          />
        </div>
      </div>
    </div>
  );
}
