import { create } from 'zustand';

type AddGoalState = {
  // Modal state
  isOpen: boolean;

  // Form values
  name: string;
  emoji: string;
  color: string;
  targetAmount: string; // As string for input
  deadline: string; // YYYY-MM-DD or empty
};

type AddGoalActions = {
  // Modal actions
  open: () => void;
  close: () => void;

  // Form actions
  setName: (name: string) => void;
  setEmoji: (emoji: string) => void;
  setColor: (color: string) => void;
  setTargetAmount: (amount: string) => void;
  setDeadline: (deadline: string) => void;

  // Reset
  reset: () => void;
};

type AddGoalStore = AddGoalState & AddGoalActions;

const initialState: AddGoalState = {
  isOpen: false,
  name: '',
  emoji: '',
  color: '',
  targetAmount: '',
  deadline: '',
};

export const useAddGoalStore = create<AddGoalStore>((set) => ({
  ...initialState,

  // Modal actions
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  // Form actions
  setName: (name) => set({ name }),
  setEmoji: (emoji) => set({ emoji }),
  setColor: (color) => set({ color }),
  setTargetAmount: (amount) => set({ targetAmount: amount }),
  setDeadline: (deadline) => set({ deadline }),

  // Reset to initial state
  reset: () => set({
    name: '',
    emoji: '',
    color: '',
    targetAmount: '',
    deadline: '',
  }),
}));
