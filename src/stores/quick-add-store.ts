import { create } from 'zustand';
import type { TransactionType } from '@/lib/types';
import type { Category } from '@/server/queries/categories';
import { getTodayString } from '@/lib/format';

type QuickAddState = {
  // Modal state
  isOpen: boolean;

  // Form values
  amount: string;
  transactionType: TransactionType;
  selectedCategory: Category | null;
  selectedAccountId: string;
  selectedDate: string; // YYYY-MM-DD format
  note: string;

  // Module form extension values
  formExtensionValues: Record<string, unknown>;

  // UI state
  categoryPickerOpen: boolean;
  datePickerOpen: boolean;
};

type QuickAddActions = {
  // Modal actions
  open: () => void;
  close: () => void;

  // Form actions
  setAmount: (amount: string) => void;
  setTransactionType: (type: TransactionType) => void;
  setSelectedCategory: (category: Category | null) => void;
  setSelectedAccountId: (accountId: string) => void;
  setSelectedDate: (date: string) => void;
  setNote: (note: string) => void;

  // Module form extension actions
  setFormExtensionValue: (extensionId: string, value: unknown) => void;

  // UI actions
  setCategoryPickerOpen: (open: boolean) => void;
  setDatePickerOpen: (open: boolean) => void;

  // Reset
  reset: () => void;
};

type QuickAddStore = QuickAddState & QuickAddActions;

const initialState: QuickAddState = {
  isOpen: false,
  amount: '',
  transactionType: 'expense',
  selectedCategory: null,
  selectedAccountId: '',
  selectedDate: getTodayString(),
  note: '',
  formExtensionValues: {},
  categoryPickerOpen: false,
  datePickerOpen: false,
};

export const useQuickAddStore = create<QuickAddStore>((set) => ({
  ...initialState,

  // Modal actions
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  // Form actions
  setAmount: (amount) => set({ amount }),
  setTransactionType: (type) => set({
    transactionType: type,
    // Reset category when changing type since categories are type-specific
    selectedCategory: null,
  }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedAccountId: (accountId) => set({ selectedAccountId: accountId }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setNote: (note) => set({ note }),

  // Module form extension actions
  setFormExtensionValue: (extensionId, value) =>
    set((state) => ({
      formExtensionValues: {
        ...state.formExtensionValues,
        [extensionId]: value,
      },
    })),

  // UI actions
  setCategoryPickerOpen: (open) => set({ categoryPickerOpen: open }),
  setDatePickerOpen: (open) => set({ datePickerOpen: open }),

  // Reset form to initial state
  reset: () => set({
    amount: '',
    transactionType: 'expense',
    selectedCategory: null,
    selectedAccountId: '',
    selectedDate: getTodayString(),
    note: '',
    formExtensionValues: {},
    categoryPickerOpen: false,
    datePickerOpen: false,
  }),
}));
