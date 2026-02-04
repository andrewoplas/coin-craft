'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { type WidgetProps } from '@/modules/types';
import { formatPHP, formatDateString } from '@/lib/format';
import { Receipt, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';
import { COLORS } from '@/lib/constants';

type Transaction = {
  id: string;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  date: string;
  note: string | null;
  categoryName: string;
  categoryIcon: string | null;
  accountName: string;
};

const typeIcons = {
  expense: <ArrowUpRight className="h-3 w-3" />,
  income: <ArrowDownLeft className="h-3 w-3" />,
  transfer: <ArrowLeftRight className="h-3 w-3" />,
};

const typeColors = {
  expense: COLORS.expense,
  income: COLORS.income,
  transfer: COLORS.transfer,
};

export function RecentTransactionsWidget({ size }: WidgetProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const limit = size === 'S' ? 3 : size === 'M' ? 5 : 10;
        const response = await fetch(`/api/dashboard/recent-transactions?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        }
      } catch (error) {
        console.error('Failed to load transactions:', error);
      }
      setLoading(false);
    }
    loadData();
  }, [size]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <Receipt className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No transactions yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Click the + button to add your first transaction
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-1">
        {transactions.map((tx) => (
          <Link
            key={tx.id}
            href={`/transactions`}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg flex-shrink-0">{tx.categoryIcon || '📦'}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{tx.categoryName}</p>
                {size !== 'S' && tx.note && (
                  <p className="text-xs text-muted-foreground truncate">{tx.note}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <span
                className="text-sm font-medium flex items-center gap-1"
                style={{ color: typeColors[tx.type] }}
              >
                {typeIcons[tx.type]}
                {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                {formatPHP(tx.amount)}
              </span>
              {size !== 'S' && (
                <span className="text-xs text-muted-foreground">
                  {formatDateString(tx.date, 'MMM d')}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
      <Link
        href="/transactions"
        className="block text-center text-sm text-primary hover:underline pt-2 mt-2 border-t"
      >
        View all transactions
      </Link>
    </div>
  );
}
