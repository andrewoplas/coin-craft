import { type ReactNode } from 'react';
import { type WidgetSize, type WidgetPosition } from '../lib/types';

// Module Route
export type ModuleRoute = {
  path: string;
  label: string;
  icon: string; // Lucide icon name
  order: number;
};

// Widget Config
export type WidgetConfig = {
  id: string;
  name: string;
  description: string;
  sizes: WidgetSize[];
  defaultSize: WidgetSize;
  component: React.ComponentType<WidgetProps>;
};

export type WidgetProps = {
  size: WidgetSize;
};

// Form Extension
export type FormExtension = {
  id: string;
  label: string;
  position: 'after-category' | 'after-account' | 'before-save';
  component: React.ComponentType<FormExtensionProps>;
  transactionTypes: ('expense' | 'income' | 'transfer')[];
  required: boolean;
};

export type FormExtensionProps = {
  value?: unknown;
  onChange: (value: unknown) => void;
  transactionType: 'expense' | 'income' | 'transfer';
};

// Module Setting
export type ModuleSetting = {
  key: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'number';
  defaultValue: unknown;
  options?: { label: string; value: unknown }[];
};

// Nudge Config
export type NudgeConfig = {
  id: string;
  message: (data: unknown) => string;
  condition: (data: unknown) => boolean;
  priority: 'low' | 'medium' | 'high';
};

// Widget Layout
export type WidgetLayout = {
  widgetId: string;
  size: WidgetSize;
  position: WidgetPosition;
};

// Module Manifest
export type ModuleManifest = {
  id: string;
  name: string;
  description: string;
  icon: string;
  characterId?: string; // Which character this belongs to (if any)

  // What the module provides
  routes: ModuleRoute[];
  dashboardWidgets: WidgetConfig[];
  formExtensions: FormExtension[];
  allocationType?: string; // If module uses allocations

  // Module behavior
  settings: ModuleSetting[];
  nudges: NudgeConfig[];

  // Default dashboard layout when this module's character is selected
  defaultWidgetLayout?: WidgetLayout[];
};
