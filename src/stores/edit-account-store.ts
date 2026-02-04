import { create } from 'zustand';
import type { AccountWithBalance } from '@/server/queries/accounts';

type EditAccountState = {
  // Modal state
  isOpen: boolean;

  // Account being edited
  accountId: string | null;
  accountType: string; // Read-only, just for display
  currentBalance: number; // Read-only, just for display

  // Editable fields
  name: string;
  icon: string;
  color: string;

  // Actions
  openForEdit: (account: AccountWithBalance) => void;
  close: () => void;
  setName: (name: string) => void;
  setIcon: (icon: string) => void;
  setColor: (color: string) => void;
  reset: () => void;
};

const initialState = {
  isOpen: false,
  accountId: null,
  accountType: '',
  currentBalance: 0,
  name: '',
  icon: '',
  color: '',
};

export const useEditAccountStore = create<EditAccountState>((set) => ({
  ...initialState,

  openForEdit: (account: AccountWithBalance) => {
    set({
      isOpen: true,
      accountId: account.id,
      accountType: account.type,
      currentBalance: account.currentBalance,
      name: account.name,
      icon: account.icon || '',
      color: account.color || '',
    });
  },

  close: () => {
    set({ isOpen: false });
  },

  setName: (name: string) => {
    set({ name });
  },

  setIcon: (icon: string) => {
    set({ icon });
  },

  setColor: (color: string) => {
    set({ color });
  },

  reset: () => {
    set(initialState);
  },
}));
