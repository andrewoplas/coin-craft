'use client';

import { useEffect, useCallback, Suspense } from 'react';
import { useDashboardStore } from '@/stores/dashboard-store';
import { WidgetContainer } from './widget-container';
import { AddWidgetModal } from './add-widget-modal';
import { Button } from '@/components/ui/button';
import { Plus, Settings, RotateCcw, Save, Loader2 } from 'lucide-react';
import { type WidgetConfig } from '@/modules/types';
import { type WidgetInstance } from '@/lib/types';
import { getDashboardLayout, saveDashboardLayout, resetDashboardLayout } from '@/server/actions/dashboard';
import { toast } from 'sonner';

type DashboardGridProps = {
  availableWidgets: Array<WidgetConfig & { moduleId: string }>;
  defaultLayout: WidgetInstance[];
  characterName?: string;
};

export function DashboardGrid({
  availableWidgets,
  defaultLayout,
  characterName,
}: DashboardGridProps) {
  const {
    isEditMode,
    toggleEditMode,
    layout,
    setLayout,
    removeWidget,
    resizeWidget,
    openAddWidgetModal,
    isDirty,
    setDirty,
  } = useDashboardStore();

  // Load saved layout on mount
  useEffect(() => {
    async function loadLayout() {
      const result = await getDashboardLayout();
      if (result.success) {
        if (result.data.length > 0) {
          setLayout(result.data);
        } else {
          setLayout(defaultLayout);
        }
      }
    }
    loadLayout();
  }, [defaultLayout, setLayout]);

  // Save layout handler
  const handleSave = useCallback(async () => {
    const result = await saveDashboardLayout(layout);
    if (result.success) {
      setDirty(false);
      toast.success('Dashboard saved!');
    } else {
      toast.error('Failed to save dashboard');
    }
  }, [layout, setDirty]);

  // Reset to default handler
  const handleReset = useCallback(async () => {
    const result = await resetDashboardLayout();
    if (result.success) {
      setLayout(defaultLayout);
      toast.success('Dashboard reset to default');
    } else {
      toast.error('Failed to reset dashboard');
    }
  }, [defaultLayout, setLayout]);

  // Get widget config by ID
  const getWidgetConfig = useCallback(
    (moduleId: string, widgetId: string) => {
      return availableWidgets.find(
        (w) => w.moduleId === moduleId && w.id === widgetId
      );
    },
    [availableWidgets]
  );

  // Get existing widget IDs to prevent duplicates
  const existingWidgetIds = layout.map((w) => w.widgetId);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
        <div>
          {characterName && (
            <p className="text-sm text-muted-foreground">
              Welcome back, {characterName}!
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isEditMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={openAddWidgetModal}
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Add Widget</span>
                <span className="sm:hidden">Add</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
              {isDirty && (
                <Button
                  size="sm"
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              )}
            </>
          )}
          <Button
            variant={isEditMode ? 'default' : 'outline'}
            size="sm"
            onClick={toggleEditMode}
          >
            <Settings className="h-4 w-4 mr-1" />
            {isEditMode ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>

      {/* Widget Grid */}
      {layout.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Your dashboard is empty
          </h3>
          <p className="text-muted-foreground mb-4">
            Add widgets to customize your dashboard
          </p>
          <Button onClick={() => { toggleEditMode(); openAddWidgetModal(); }}>
            <Plus className="h-4 w-4 mr-1" />
            Add Your First Widget
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {layout.map((instance) => {
            const config = getWidgetConfig(instance.moduleId, instance.widgetId);
            if (!config) return null;

            const WidgetComponent = config.component;

            return (
              <WidgetContainer
                key={instance.id}
                title={config.name}
                moduleId={instance.moduleId}
                size={instance.size}
                isEditMode={isEditMode}
                availableSizes={config.sizes}
                onRemove={() => removeWidget(instance.id)}
                onResize={(size) => resizeWidget(instance.id, size)}
              >
                <Suspense
                  fallback={
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  }
                >
                  <WidgetComponent size={instance.size} />
                </Suspense>
              </WidgetContainer>
            );
          })}
        </div>
      )}

      {/* Add Widget Modal */}
      <AddWidgetModal
        availableWidgets={availableWidgets}
        existingWidgetIds={existingWidgetIds}
      />
    </div>
  );
}
