import { create } from 'zustand';
import type { CategoryType } from '@/lib/types';

type AddCategoryState = {
  // Modal state
  isOpen: boolean;

  // Form values
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  parentId: string | null; // For subcategories
};

type AddCategoryActions = {
  // Modal actions
  open: (type?: CategoryType) => void; // Can pre-set type when opening
  close: () => void;

  // Form actions
  setName: (name: string) => void;
  setType: (type: CategoryType) => void;
  setIcon: (icon: string) => void;
  setColor: (color: string) => void;
  setParentId: (parentId: string | null) => void;

  // Reset
  reset: () => void;
};

type AddCategoryStore = AddCategoryState & AddCategoryActions;

const initialState: AddCategoryState = {
  isOpen: false,
  name: '',
  type: 'expense',
  icon: '',
  color: '',
  parentId: null,
};

export const useAddCategoryStore = create<AddCategoryStore>((set) => ({
  ...initialState,

  // Modal actions
  open: (type) => set({ isOpen: true, type: type || 'expense' }),
  close: () => set({ isOpen: false }),

  // Form actions
  setName: (name) => set({ name }),
  setType: (type) => set({ type }),
  setIcon: (icon) => set({ icon }),
  setColor: (color) => set({ color }),
  setParentId: (parentId) => set({ parentId }),

  // Reset to initial state (except isOpen)
  reset: () => set({
    name: '',
    type: 'expense',
    icon: '',
    color: '',
    parentId: null,
  }),
}));
