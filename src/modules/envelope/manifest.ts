import { type ModuleManifest } from '../types';
import { WalletPicker } from './form-extensions/wallet-picker';

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

  dashboardWidgets: [],
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
  nudges: [],
};
