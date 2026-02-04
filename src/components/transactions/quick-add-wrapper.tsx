'use client';

import { useEffect, useState } from 'react';
import { useQuickAddStore } from '@/stores/quick-add-store';
import { QuickAddModal } from './quick-add-modal';
import type { CategoryWithSubcategories } from '@/server/queries/categories';
import type { Account } from '@/server/queries/accounts';
import { fetchAllCategories } from '@/server/actions/categories';
import { fetchUserAccounts } from '@/server/actions/accounts';

type QuickAddWrapperProps = {
  activeModules: string[];
};

export function QuickAddWrapper({ activeModules }: QuickAddWrapperProps) {
  const isOpen = useQuickAddStore((state) => state.isOpen);
  const openModal = useQuickAddStore((state) => state.open);
  const closeModal = useQuickAddStore((state) => state.close);
  const reset = useQuickAddStore((state) => state.reset);

  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories and accounts on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResult, accountsResult] = await Promise.all([
          fetchAllCategories(),
          fetchUserAccounts(),
        ]);

        if (categoriesResult.success && categoriesResult.data) {
          setCategories(categoriesResult.data);
        }

        if (accountsResult.success && accountsResult.data) {
          setAccounts(accountsResult.data);
        }
      } catch (error) {
        console.error('Error fetching Quick Add data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      openModal();
    } else {
      closeModal();
      // Reset form when closing
      reset();
    }
  };

  // Don't render modal until data is loaded
  if (loading) {
    return null;
  }

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
