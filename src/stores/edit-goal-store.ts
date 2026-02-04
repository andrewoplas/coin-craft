import { create } from 'zustand';
import type { Goal } from '@/server/queries/allocations';

type EditGoalState = {
  // Modal state
  isOpen: boolean;

  // Goal being edited
  goalId: string | null;

  // Read-only fields (for display)
  currentAmount: number;
  createdAt: Date | null;

  // Editable fields
  name: string;
  icon: string;
  color: string;
  targetAmount: number; // in centavos
  deadline: string; // YYYY-MM-DD or empty

  // Actions
  openForEdit: (goal: Goal) => void;
  close: () => void;
  setName: (name: string) => void;
  setIcon: (icon: string) => void;
  setColor: (color: string) => void;
  setTargetAmount: (amount: number) => void;
  setDeadline: (deadline: string) => void;
  reset: () => void;
};

const initialState = {
  isOpen: false,
  goalId: null,
  currentAmount: 0,
  createdAt: null,
  name: '',
  icon: '',
  color: '',
  targetAmount: 0,
  deadline: '',
};

export const useEditGoalStore = create<EditGoalState>((set) => ({
  ...initialState,

  openForEdit: (goal: Goal) => {
    set({
      isOpen: true,
      goalId: goal.id,
      currentAmount: goal.currentAmount || 0,
      createdAt: goal.createdAt,
      name: goal.name,
      icon: goal.icon || '',
      color: goal.color || '',
      targetAmount: goal.targetAmount || 0,
      deadline: goal.deadline || '',
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

  setTargetAmount: (amount: number) => {
    set({ targetAmount: amount });
  },

  setDeadline: (deadline: string) => {
    set({ deadline });
  },

  reset: () => {
    set(initialState);
  },
}));
