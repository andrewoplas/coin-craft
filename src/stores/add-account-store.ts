import { create } from 'zustand';
import type { AccountType } from '@/lib/types';

type AddAccountState = {
  // Modal state
  isOpen: boolean;

  // Form values
  name: string;
  type: AccountType;
  icon: string;
  color: string;
  initialBalance: string; // As string for input, will convert to centavos on save
};

type AddAccountActions = {
  // Modal actions
  open: () => void;
  close: () => void;

  // Form actions
  setName: (name: string) => void;
  setType: (type: AccountType) => void;
  setIcon: (icon: string) => void;
  setColor: (color: string) => void;
  setInitialBalance: (balance: string) => void;

  // Reset
  reset: () => void;
};

type AddAccountStore = AddAccountState & AddAccountActions;

const initialState: AddAccountState = {
  isOpen: false,
  name: '',
  type: 'cash',
  icon: '',
  color: '',
  initialBalance: '0',
};

export const useAddAccountStore = create<AddAccountStore>((set) => ({
  ...initialState,

  // Modal actions
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  // Form actions
  setName: (name) => set({ name }),
  setType: (type) => set({ type }),
  setIcon: (icon) => set({ icon }),
  setColor: (color) => set({ color }),
  setInitialBalance: (balance) => set({ initialBalance: balance }),

  // Reset to initial state (except isOpen)
  reset: () => set({
    name: '',
    type: 'cash',
    icon: '',
    color: '',
    initialBalance: '0',
  }),
}));
