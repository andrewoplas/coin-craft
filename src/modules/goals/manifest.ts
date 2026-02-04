import { type ModuleManifest } from '../types';
import { GoalPicker } from './form-extensions/goal-picker';

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
  formExtensions: [
    {
      id: 'goals-allocation-picker',
      label: 'Allocate to goal?',
      position: 'after-account',
      component: GoalPicker,
      transactionTypes: ['income'],
      required: false,
    },
  ],
  allocationType: 'goal',
  settings: [],
  nudges: [],
};
