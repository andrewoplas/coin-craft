import { create } from 'zustand';
import type { Envelope } from '@/server/queries/allocations';

type EditEnvelopeState = {
  // Modal state
  isOpen: boolean;

  // Envelope being edited
  envelopeId: string | null;

  // Read-only fields (for display)
  currentAmount: number;
  periodStart: string | null;

  // Editable fields
  name: string;
  icon: string;
  color: string;
  targetAmount: number; // in centavos (will be converted to pesos for display)
  period: 'weekly' | 'monthly' | 'none';
  rolloverEnabled: boolean;

  // Actions
  openForEdit: (envelope: Envelope) => void;
  close: () => void;
  setName: (name: string) => void;
  setIcon: (icon: string) => void;
  setColor: (color: string) => void;
  setTargetAmount: (amount: number) => void;
  setPeriod: (period: 'weekly' | 'monthly' | 'none') => void;
  setRolloverEnabled: (enabled: boolean) => void;
  reset: () => void;
};

const initialState = {
  isOpen: false,
  envelopeId: null,
  currentAmount: 0,
  periodStart: null,
  name: '',
  icon: '',
  color: '',
  targetAmount: 0,
  period: 'monthly' as const,
  rolloverEnabled: false,
};

export const useEditEnvelopeStore = create<EditEnvelopeState>((set) => ({
  ...initialState,

  openForEdit: (envelope: Envelope) => {
    // Parse config to get rolloverEnabled
    let rolloverEnabled = false;
    try {
      const config = envelope.config ? JSON.parse(envelope.config) : {};
      rolloverEnabled = config.rolloverEnabled || false;
    } catch {
      rolloverEnabled = false;
    }

    set({
      isOpen: true,
      envelopeId: envelope.id,
      currentAmount: envelope.currentAmount || 0,
      periodStart: envelope.periodStart,
      name: envelope.name,
      icon: envelope.icon || '',
      color: envelope.color || '',
      targetAmount: envelope.targetAmount || 0,
      period: (envelope.period as 'weekly' | 'monthly' | 'none') || 'monthly',
      rolloverEnabled,
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

  setPeriod: (period: 'weekly' | 'monthly' | 'none') => {
    set({ period });
  },

  setRolloverEnabled: (enabled: boolean) => {
    set({ rolloverEnabled: enabled });
  },

  reset: () => {
    set(initialState);
  },
}));
