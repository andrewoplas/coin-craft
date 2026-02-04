'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAddAccountStore } from '@/stores/add-account-store';
import { AddAccountModal } from './add-account-modal';

export function AccountsHeader() {
  const isOpen = useAddAccountStore((state) => state.isOpen);
  const open = useAddAccountStore((state) => state.open);
  const close = useAddAccountStore((state) => state.close);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
        <Button onClick={open}>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      <AddAccountModal open={isOpen} onOpenChange={close} />
    </>
  );
}
