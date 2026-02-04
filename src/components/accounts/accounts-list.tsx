'use client';

import { useRouter } from 'next/navigation';
import type { AccountWithBalance } from '@/server/queries/accounts';
import { AccountCard } from './account-card';
import { EditAccountModal } from './edit-account-modal';
import { Button } from '@/components/ui/button';
import { useAddAccountStore } from '@/stores/add-account-store';
import { useEditAccountStore } from '@/stores/edit-account-store';

type AccountsListProps = {
  accounts: AccountWithBalance[];
};

export function AccountsList({ accounts }: AccountsListProps) {
  const router = useRouter();
  const openAddAccount = useAddAccountStore((state) => state.open);
  const openEditAccount = useEditAccountStore((state) => state.openForEdit);
  const isEditModalOpen = useEditAccountStore((state) => state.isOpen);
  const closeEditModal = useEditAccountStore((state) => state.close);

  const handleAccountClick = (accountId: string) => {
    // Navigate to transactions page with account filter
    router.push(`/transactions?account=${accountId}`);
  };

  const handleEditAccount = (account: AccountWithBalance) => {
    openEditAccount(account);
  };

  const handleArchiveAccount = (accountId: string) => {
    // Archive functionality - dialog handles the actual archiving
    // This callback is for post-archive actions if needed
    console.log('Account archived:', accountId);
  };

  if (accounts.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-12">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          {/* Illustration - emoji placeholder */}
          <div className="text-8xl mb-6">🏦</div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-foreground mb-3">
            No accounts yet
          </h2>

          {/* Subtext */}
          <p className="text-muted-foreground mb-8">
            Add your first account to start tracking your finances
          </p>

          {/* CTA Button */}
          <Button onClick={openAddAccount} size="lg">
            Add Your First Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onClick={() => handleAccountClick(account.id)}
            onEdit={() => handleEditAccount(account)}
            onArchive={() => handleArchiveAccount(account.id)}
          />
        ))}
      </div>

      {/* Edit Account Modal */}
      <EditAccountModal
        open={isEditModalOpen}
        onOpenChange={closeEditModal}
      />
    </>
  );
}
