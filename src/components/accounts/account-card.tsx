'use client';

import type { AccountWithBalance } from '@/server/queries/accounts';
import { formatPHP } from '@/lib/format';
import type { AccountType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { ArchiveAccountDialog } from './archive-account-dialog';

type AccountCardProps = {
  account: AccountWithBalance;
  onClick?: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
};

// Map account types to readable labels
const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  cash: 'Cash',
  bank: 'Bank Account',
  e_wallet: 'E-Wallet',
  credit_card: 'Credit Card',
};

// Default colors for account types (if no custom color set)
const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  cash: '#10B981', // green
  bank: '#3B82F6', // blue
  e_wallet: '#8B5CF6', // purple
  credit_card: '#EF4444', // red
};

export function AccountCard({ account, onClick, onEdit, onArchive }: AccountCardProps) {
  // Use custom color or default by type
  const accentColor = account.color || ACCOUNT_TYPE_COLORS[account.type];

  // Determine if balance is negative
  const isNegative = account.currentBalance < 0;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    onEdit?.();
  };

  const handleArchive = () => {
    onArchive?.();
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
      style={{ borderTop: `4px solid ${accentColor}` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{account.icon || '💰'}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{account.name}</h3>
            <p className="text-sm text-gray-500">{ACCOUNT_TYPE_LABELS[account.type]}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Edit button */}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit account</span>
            </Button>
          )}

          {/* Archive button */}
          {onArchive && (
            <ArchiveAccountDialog
              accountId={account.id}
              accountName={account.name}
              currentBalance={account.currentBalance}
            />
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-1">Current Balance</p>
        <p className={`text-2xl font-bold ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>
          {formatPHP(account.currentBalance)}
        </p>
      </div>
    </div>
  );
}
