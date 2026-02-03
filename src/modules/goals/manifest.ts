import { type ModuleManifest } from '../types';

export const goalsManifest: ModuleManifest = {
  id: 'goals',
  name: 'Goals',
  description: 'Save toward specific targets with progress tracking',
  icon: '🎯',
  characterId: 'saver',

  routes: [
    {
      path: '/modules/goals',
      label: 'Goals',
      icon: 'Target',
      order: 5,
    },
  ],

  dashboardWidgets: [],
  formExtensions: [],
  allocationType: 'goal',
  settings: [],
  nudges: [],
};
