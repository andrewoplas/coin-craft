import { type ModuleManifest } from '../types';
import { GoalPicker } from './form-extensions/goal-picker';
import {
  GoalProgressWidget,
  ProjectedDatesWidget,
  SavingsRateWidget,
} from './widgets';

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

  dashboardWidgets: [
    {
      id: 'goal-progress',
      name: 'Goal Progress',
      description: 'All your goals with visual progress bars',
      sizes: ['S', 'M', 'L'],
      defaultSize: 'M',
      component: GoalProgressWidget,
    },
    {
      id: 'projected-dates',
      name: 'Projected Dates',
      description: 'When each goal will be reached at current rate',
      sizes: ['S', 'M', 'L'],
      defaultSize: 'S',
      component: ProjectedDatesWidget,
    },
    {
      id: 'savings-rate',
      name: 'Savings Rate',
      description: 'Monthly savings trend and totals',
      sizes: ['S', 'M', 'L'],
      defaultSize: 'M',
      component: SavingsRateWidget,
    },
  ],
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
  nudges: [
    {
      id: 'on-track-alert',
      message: (data: unknown) => {
        const goal = data as { name: string; percentage: number };
        return `🎯 "${goal.name}" is ${goal.percentage.toFixed(0)}% complete! You're on track!`;
      },
      condition: (data: unknown) => {
        const goal = data as { isOnTrack: boolean; percentage: number };
        return goal.isOnTrack && goal.percentage >= 50 && goal.percentage < 100;
      },
      priority: 'medium',
    },
    {
      id: 'off-track-alert',
      message: (data: unknown) => {
        const goal = data as { name: string; requiredMonthlySavings: number };
        return `⚠️ "${goal.name}" needs ₱${(goal.requiredMonthlySavings / 100).toFixed(2)}/month to stay on track.`;
      },
      condition: (data: unknown) => {
        const goal = data as { isOnTrack: boolean; hasDeadline: boolean };
        return !goal.isOnTrack && goal.hasDeadline;
      },
      priority: 'high',
    },
    {
      id: 'milestone-celebration',
      message: (data: unknown) => {
        const goal = data as { name: string; milestone: number };
        return `🎉 Milestone reached! "${goal.name}" is ${goal.milestone}% complete!`;
      },
      condition: (data: unknown) => {
        const goal = data as { percentage: number; milestone: number };
        return [25, 50, 75, 100].includes(goal.milestone) && goal.percentage >= goal.milestone;
      },
      priority: 'low',
    },
    {
      id: 'no-contribution-reminder',
      message: (data: unknown) => {
        const info = data as { daysWithoutContribution: number };
        return `💰 It's been ${info.daysWithoutContribution} days since your last savings contribution. Keep the momentum going!`;
      },
      condition: (data: unknown) => {
        const info = data as { daysWithoutContribution: number };
        return info.daysWithoutContribution >= 30;
      },
      priority: 'medium',
    },
  ],
};
