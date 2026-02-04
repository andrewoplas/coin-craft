'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/stores/dashboard-store';
import { type WidgetConfig } from '@/modules/types';
import { Plus, Check } from 'lucide-react';

type AddWidgetModalProps = {
  availableWidgets: Array<WidgetConfig & { moduleId: string }>;
  existingWidgetIds: string[];
};

export function AddWidgetModal({ availableWidgets, existingWidgetIds }: AddWidgetModalProps) {
  const { isAddWidgetModalOpen, closeAddWidgetModal, addWidget } = useDashboardStore();
  const [addedWidgets, setAddedWidgets] = useState<Set<string>>(new Set());

  const handleAddWidget = (widget: WidgetConfig & { moduleId: string }) => {
    addWidget({
      moduleId: widget.moduleId,
      widgetId: widget.id,
      size: widget.defaultSize,
    });
    setAddedWidgets((prev) => new Set(prev).add(widget.id));
  };

  const handleClose = () => {
    setAddedWidgets(new Set());
    closeAddWidgetModal();
  };

  // Group widgets by module
  const widgetsByModule: Record<string, Array<WidgetConfig & { moduleId: string }>> = {};
  for (const widget of availableWidgets) {
    if (!widgetsByModule[widget.moduleId]) {
      widgetsByModule[widget.moduleId] = [];
    }
    widgetsByModule[widget.moduleId].push(widget);
  }

  const moduleNames: Record<string, string> = {
    core: 'Core',
    envelope: 'Envelopes',
    goals: 'Goals',
    statistics: 'Statistics',
  };

  return (
    <Dialog open={isAddWidgetModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
          <DialogDescription>
            Choose widgets to add to your dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(widgetsByModule).map(([moduleId, widgets]) => (
            <div key={moduleId}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                {moduleNames[moduleId] || moduleId}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {widgets.map((widget) => {
                  const isAlreadyAdded = existingWidgetIds.includes(widget.id) || addedWidgets.has(widget.id);

                  return (
                    <div
                      key={widget.id}
                      className={`border rounded-lg p-3 transition-colors ${
                        isAlreadyAdded
                          ? 'bg-muted/50 border-muted'
                          : 'hover:border-primary/50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-sm">{widget.name}</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            {widget.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Sizes: {widget.sizes.join(', ')}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={isAlreadyAdded ? 'secondary' : 'default'}
                          className="ml-2 flex-shrink-0"
                          onClick={() => !isAlreadyAdded && handleAddWidget(widget)}
                          disabled={isAlreadyAdded}
                        >
                          {isAlreadyAdded ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t">
          <Button onClick={handleClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
