// Shared TypeScript types across the application

export type TransactionType = 'expense' | 'income' | 'transfer';
export type AccountType = 'cash' | 'bank' | 'e_wallet' | 'credit_card';
export type CategoryType = 'expense' | 'income';
export type Period = 'weekly' | 'monthly' | 'yearly' | 'custom' | 'none';

// User settings
export type UserSettings = {
  displayName?: string;
  defaultCurrency: string;
  initialDayOfMonth: number;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
};

// Module-specific
export type ModuleType = 'envelope' | 'goal' | 'debt' | 'freelancer' | 'shared' | 'statistics' | 'labels' | 'planned-payments' | 'export' | 'receipt';

// Dashboard widget
export type WidgetSize = 'S' | 'M' | 'L';

export type WidgetPosition = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type WidgetInstance = {
  id: string;
  moduleId: string;
  widgetId: string;
  size: WidgetSize;
  position: WidgetPosition;
};
