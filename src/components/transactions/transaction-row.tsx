'use client';

import type { TransactionWithRelations } from '@/server/queries/transactions';

type TransactionRowProps = {
  transaction: TransactionWithRelations;
  onClick?: () => void;
};

export function TransactionRow({ transaction, onClick }: TransactionRowProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 hover:bg-gray-50 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{transaction.category.icon || '📝'}</div>
          <div>
            <p className="font-medium text-gray-900">
              {transaction.category.name}
            </p>
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
