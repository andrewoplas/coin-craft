import { create } from 'zustand';

type Period = 'weekly' | 'monthly';

type AddEnvelopeState = {
  // Modal state
  isOpen: boolean;

  // Form values
  name: string;
  emoji: string;
  targetAmount: string; // As string for input, will convert to centavos on save
  period: Period;
  rolloverEnabled: boolean;
};

type AddEnvelopeActions = {
  // Modal actions
  open: () => void;
  close: () => void;

  // Form actions
  setName: (name: string) => void;
  setEmoji: (emoji: string) => void;
  setTargetAmount: (amount: string) => void;
  setPeriod: (period: Period) => void;
  setRolloverEnabled: (enabled: boolean) => void;

  // Reset
  reset: () => void;
};

type AddEnvelopeStore = AddEnvelopeState & AddEnvelopeActions;

const initialState: AddEnvelopeState = {
  isOpen: false,
  name: '',
  emoji: '',
  targetAmount: '0',
  period: 'monthly',
  rolloverEnabled: false,
};

export const useAddEnvelopeStore = create<AddEnvelopeStore>((set) => ({
  ...initialState,

  // Modal actions
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  // Form actions
  setName: (name) => set({ name }),
  setEmoji: (emoji) => set({ emoji }),
  setTargetAmount: (amount) => set({ targetAmount: amount }),
  setPeriod: (period) => set({ period }),
  setRolloverEnabled: (enabled) => set({ rolloverEnabled: enabled }),

  // Reset to initial state (except isOpen)
  reset: () => set({
    name: '',
    emoji: '',
    targetAmount: '0',
    period: 'monthly',
    rolloverEnabled: false,
  }),
}));
