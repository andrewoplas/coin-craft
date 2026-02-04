'use client';

import { type ReactNode } from 'react';
import { X, GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { type WidgetSize } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type WidgetContainerProps = {
  title: string;
  moduleId?: string;
  size: WidgetSize;
  isEditMode: boolean;
  onRemove?: () => void;
  onResize?: (size: WidgetSize) => void;
  availableSizes: WidgetSize[];
  children: ReactNode;
};

const sizeClasses: Record<WidgetSize, string> = {
  S: 'col-span-1 row-span-1',
  M: 'col-span-1 md:col-span-2 row-span-1',
  L: 'col-span-1 md:col-span-2 lg:col-span-3 row-span-2',
};

const sizeHeights: Record<WidgetSize, string> = {
  S: 'min-h-[140px]',
  M: 'min-h-[200px]',
  L: 'min-h-[300px]',
};

export function WidgetContainer({
  title,
  moduleId,
  size,
  isEditMode,
  onRemove,
  onResize,
  availableSizes,
  children,
}: WidgetContainerProps) {
  const canGrow = availableSizes.indexOf(size) < availableSizes.length - 1;
  const canShrink = availableSizes.indexOf(size) > 0;

  const handleGrow = () => {
    if (onResize && canGrow) {
      const currentIndex = availableSizes.indexOf(size);
      onResize(availableSizes[currentIndex + 1]);
    }
  };

  const handleShrink = () => {
    if (onResize && canShrink) {
      const currentIndex = availableSizes.indexOf(size);
      onResize(availableSizes[currentIndex - 1]);
    }
  };

  return (
    <div
      className={cn(
        'bg-card border rounded-xl shadow-sm transition-all',
        sizeClasses[size],
        sizeHeights[size],
        isEditMode && 'ring-2 ring-primary/20 ring-offset-2'
      )}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            {isEditMode && (
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            )}
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {moduleId && moduleId !== 'core' && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {moduleId}
              </span>
            )}
          </div>

          {isEditMode && (
            <div className="flex items-center gap-1">
              {canShrink && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleShrink}
                  title="Shrink"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
              )}
              {canGrow && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleGrow}
                  title="Expand"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
              )}
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={onRemove}
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
