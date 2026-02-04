'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { type WidgetProps } from '@/modules/types';
import { formatPHP } from '@/lib/format';
import { Wallet, Building2, Smartphone, CreditCard, ChevronRight } from 'lucide-react';
import type { AccountType } from '@/lib/types';

type AccountData = {
  id: string;
  name: string;
  type: AccountType;
  icon: string | null;
  currentBalance: number;
};

const accountTypeIcons: Record<AccountType, React.ReactNode> = {
  cash: <Wallet className="h-4 w-4" />,
  bank: <Building2 className="h-4 w-4" />,
  e_wallet: <Smartphone className="h-4 w-4" />,
  credit_card: <CreditCard className="h-4 w-4" />,
};

export function AccountsOverviewWidget({ size }: WidgetProps) {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/dashboard/accounts');
        if (response.ok) {
          const data = await response.json();
          setAccounts(data);
        }
      } catch (error) {
        console.error('Failed to load accounts:', error);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <Wallet className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No accounts yet</p>
        <Link
          href="/accounts"
          className="text-sm text-primary hover:underline mt-1"
        >
          Add one
        </Link>
      </div>
    );
  }

  const maxItems = size === 'S' ? 3 : size === 'M' ? 5 : 8;
  const displayAccounts = accounts.slice(0, maxItems);
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  return (
    <div className="h-full flex flex-col">
      {size !== 'S' && (
        <div className="flex items-center justify-between mb-3 pb-2 border-b">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Total</span>
          <span className="font-semibold">{formatPHP(totalBalance)}</span>
        </div>
      )}
      <div className="flex-1 space-y-2">
        {displayAccounts.map((account) => (
          <Link
            key={account.id}
            href={`/transactions?account=${account.id}`}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{account.icon || '💰'}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{account.name}</span>
                {size !== 'S' && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {accountTypeIcons[account.type]}
                    {account.type.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-sm font-medium ${account.currentBalance < 0 ? 'text-red-500' : ''}`}>
                {formatPHP(account.currentBalance)}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
      {accounts.length > maxItems && (
        <Link
          href="/accounts"
          className="block text-center text-sm text-primary hover:underline pt-2 mt-2 border-t"
        >
          View all {accounts.length} accounts
        </Link>
      )}
    </div>
  );
}
