import { create } from 'zustand';

type TransferEnvelopeState = {
  // Modal state
  isOpen: boolean;

  // Form values
  sourceEnvelopeId: string;
  targetEnvelopeId: string;
  amount: string; // As string for input, will convert to centavos on save
};

type TransferEnvelopeActions = {
  // Modal actions
  open: (sourceId?: string) => void;
  close: () => void;

  // Form actions
  setSourceEnvelopeId: (id: string) => void;
  setTargetEnvelopeId: (id: string) => void;
  setAmount: (amount: string) => void;

  // Reset
  reset: () => void;
};

type TransferEnvelopeStore = TransferEnvelopeState & TransferEnvelopeActions;

const initialState: TransferEnvelopeState = {
  isOpen: false,
  sourceEnvelopeId: '',
  targetEnvelopeId: '',
  amount: '0',
};

export const useTransferEnvelopeStore = create<TransferEnvelopeStore>((set) => ({
  ...initialState,

  // Modal actions
  open: (sourceId) => set({
    isOpen: true,
    sourceEnvelopeId: sourceId || '',
  }),
  close: () => set({ isOpen: false }),

  // Form actions
  setSourceEnvelopeId: (id) => set({ sourceEnvelopeId: id }),
  setTargetEnvelopeId: (id) => set({ targetEnvelopeId: id }),
  setAmount: (amount) => set({ amount }),

  // Reset to initial state (except isOpen)
  reset: () => set({
    sourceEnvelopeId: '',
    targetEnvelopeId: '',
    amount: '0',
  }),
}));
