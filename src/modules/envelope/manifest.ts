import { type ModuleManifest } from '../types';

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
  formExtensions: [],
  allocationType: 'envelope',
  settings: [],
  nudges: [],
};
