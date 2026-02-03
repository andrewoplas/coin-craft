import { type ModuleManifest } from '../types';

export const statisticsManifest: ModuleManifest = {
  id: 'statistics',
  name: 'Statistics',
  description: 'Charts, reports, and spending insights',
  icon: '📊',

  routes: [
    {
      path: '/statistics',
      label: 'Statistics',
      icon: 'BarChart3',
      order: 10,
    },
  ],

  dashboardWidgets: [],
  formExtensions: [],
  settings: [],
  nudges: [],
};
