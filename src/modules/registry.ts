import { type ModuleManifest } from './types';
import { coreManifest } from './core/manifest';
import { statisticsManifest } from './statistics/manifest';
import { envelopeManifest } from './envelope/manifest';
import { goalsManifest } from './goals/manifest';

// All available modules
const ALL_MODULES: Record<string, ModuleManifest> = {
  core: coreManifest,
  statistics: statisticsManifest,
  envelope: envelopeManifest,
  goals: goalsManifest,
};

/**
 * Get routes from active modules
 */
export function getActiveRoutes(activeModuleIds: string[]) {
  const routes = [];

  for (const moduleId of activeModuleIds) {
    const module = ALL_MODULES[moduleId];
    if (module && module.routes) {
      routes.push(...module.routes);
    }
  }

  // Sort by order
  routes.sort((a, b) => a.order - b.order);

  return routes;
}

/**
 * Get dashboard widgets from active modules
 */
export function getActiveWidgets(activeModuleIds: string[]) {
  const widgets = [];

  for (const moduleId of activeModuleIds) {
    const module = ALL_MODULES[moduleId];
    if (module && module.dashboardWidgets) {
      widgets.push(...module.dashboardWidgets.map(w => ({ ...w, moduleId })));
    }
  }

  return widgets;
}

/**
 * Get form extensions from active modules
 */
export function getActiveFormExtensions(activeModuleIds: string[]) {
  const extensions = [];

  for (const moduleId of activeModuleIds) {
    const module = ALL_MODULES[moduleId];
    if (module && module.formExtensions) {
      extensions.push(...module.formExtensions.map(e => ({ ...e, moduleId })));
    }
  }

  return extensions;
}

/**
 * Get a specific module by ID
 */
export function getModule(moduleId: string): ModuleManifest | undefined {
  return ALL_MODULES[moduleId];
}

/**
 * Get all available modules
 */
export function getAllModules(): ModuleManifest[] {
  return Object.values(ALL_MODULES);
}
