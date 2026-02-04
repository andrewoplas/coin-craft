import { type ModuleManifest } from '../types';
import { WalletPicker } from './form-extensions/wallet-picker';
import {
  EnvelopeOverviewWidget,
  LowBalanceWarningsWidget,
  AllocationSummaryWidget,
} from './widgets';

export const envelopeManifest: ModuleManifest = {
  id: 'envelope',
  name: 'Envelopes',
  description: 'Budget with envelope-style spending wallets',
  icon: '📋',
  characterId: 'planner',

  routes: [
    {
      path: '/modules/envelopes',
      label: 'Envelopes',
      icon: 'Wallet2',
      order: 4,
    },
  ],

  dashboardWidgets: [
    {
      id: 'envelope-overview',
      name: 'Envelope Overview',
      description: 'All your envelopes with mini progress bars',
      sizes: ['S', 'M', 'L'],
      defaultSize: 'M',
      component: EnvelopeOverviewWidget,
    },
    {
      id: 'low-balance-warnings',
      name: 'Low Balance Warnings',
      description: 'Envelopes that are running low (>80% spent)',
      sizes: ['S', 'M', 'L'],
      defaultSize: 'S',
      component: LowBalanceWarningsWidget,
    },
    {
      id: 'allocation-summary',
      name: 'Allocation Summary',
      description: 'Total allocated vs total spent across all envelopes',
      sizes: ['S', 'M', 'L'],
      defaultSize: 'M',
      component: AllocationSummaryWidget,
    },
  ],
  formExtensions: [
    {
      id: 'envelope-wallet-picker',
      label: 'Which wallet?',
      position: 'after-category',
      component: WalletPicker,
      transactionTypes: ['expense'],
      required: false,
    },
  ],
  allocationType: 'envelope',
  settings: [],
  nudges: [
    {
      id: 'low-balance-warning',
      message: (data: unknown) => {
        const envelope = data as { name: string; remaining: number; percentage: number };
        return `⚠️ "${envelope.name}" is ${envelope.percentage.toFixed(0)}% spent! Only ₱${(envelope.remaining / 100).toFixed(2)} left.`;
      },
      condition: (data: unknown) => {
        const envelope = data as { percentage: number };
        return envelope.percentage >= 80;
      },
      priority: 'high',
    },
    {
      id: 'unallocated-income-prompt',
      message: (data: unknown) => {
        const info = data as { unallocatedAmount: number };
        return `💰 You have ₱${(info.unallocatedAmount / 100).toFixed(2)} in unallocated income. Consider adding it to your envelopes!`;
      },
      condition: (data: unknown) => {
        const info = data as { unallocatedAmount: number };
        return info.unallocatedAmount > 0;
      },
      priority: 'medium',
    },
    {
      id: 'under-budget-streak',
      message: (data: unknown) => {
        const info = data as { streakDays: number };
        return `🎉 Amazing! You've stayed under budget for ${info.streakDays} days in a row! Keep it up!`;
      },
      condition: (data: unknown) => {
        const info = data as { streakDays: number };
        return info.streakDays >= 7;
      },
      priority: 'low',
    },
  ],
};
