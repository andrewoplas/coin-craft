'use client';

import { useQuickAddStore } from '@/stores/quick-add-store';
import { QuickAddModal } from './quick-add-modal';
import type { CategoryWithSubcategories } from '@/server/queries/categories';
import type { Account } from '@/server/queries/accounts';

type QuickAddWrapperProps = {
  activeModules: string[];
  categories: CategoryWithSubcategories[];
  accounts: Account[];
};

export function QuickAddWrapper({ activeModules, categories, accounts }: QuickAddWrapperProps) {
  const isOpen = useQuickAddStore((state) => state.isOpen);
  const openModal = useQuickAddStore((state) => state.open);
  const closeModal = useQuickAddStore((state) => state.close);
  const reset = useQuickAddStore((state) => state.reset);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      openModal();
    } else {
      closeModal();
      // Reset form when closing
      reset();
    }
  };

  return (
    <QuickAddModal
      open={isOpen}
      onOpenChange={handleOpenChange}
      categories={categories}
      accounts={accounts}
      activeModules={activeModules}
    />
  );
}
