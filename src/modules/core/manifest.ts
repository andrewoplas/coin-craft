import { type ModuleManifest } from '../types';

export const coreManifest: ModuleManifest = {
  id: 'core',
  name: 'Core',
  description: 'Essential transaction tracking and account management',
  icon: '💰',

  routes: [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      order: 0,
    },
    {
      path: '/transactions',
      label: 'Transactions',
      icon: 'Receipt',
      order: 1,
    },
    {
      path: '/accounts',
      label: 'Accounts',
      icon: 'Wallet',
      order: 2,
    },
    {
      path: '/categories',
      label: 'Categories',
      icon: 'Tags',
      order: 3,
    },
  ],

  dashboardWidgets: [],
  formExtensions: [],
  settings: [],
  nudges: [],
};
