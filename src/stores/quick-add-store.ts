import { create } from 'zustand';

type QuickAddStore = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useQuickAddStore = create<QuickAddStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
