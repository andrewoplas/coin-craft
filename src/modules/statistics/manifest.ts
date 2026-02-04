import { type ModuleManifest } from '../types';
import { TrendChartWidget } from './widgets/trend-chart-widget';
import { PeriodComparisonWidget } from './widgets/period-comparison-widget';
import { TopCategoriesWidget } from './widgets/top-categories-widget';

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

  dashboardWidgets: [
    {
      id: 'trend-chart',
      name: 'Spending Trend',
      description: '6-month spending trend line chart',
      sizes: ['S', 'M', 'L'],
      defaultSize: 'M',
      component: TrendChartWidget,
    },
    {
      id: 'period-comparison',
      name: 'Period Comparison',
      description: 'Compare this period vs previous period',
      sizes: ['S', 'M'],
      defaultSize: 'S',
      component: PeriodComparisonWidget,
    },
    {
      id: 'top-categories',
      name: 'Top Categories',
      description: 'Top spending categories this month',
      sizes: ['S', 'M'],
      defaultSize: 'S',
      component: TopCategoriesWidget,
    },
  ],
  formExtensions: [],
  settings: [],
  nudges: [],
};
