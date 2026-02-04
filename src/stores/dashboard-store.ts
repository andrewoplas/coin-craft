'use client';

import { create } from 'zustand';
import { type WidgetSize, type WidgetInstance } from '@/lib/types';

type DashboardStore = {
  // Edit mode state
  isEditMode: boolean;
  setEditMode: (value: boolean) => void;
  toggleEditMode: () => void;

  // Add widget modal state
  isAddWidgetModalOpen: boolean;
  openAddWidgetModal: () => void;
  closeAddWidgetModal: () => void;

  // Layout state (managed locally, synced with server)
  layout: WidgetInstance[];
  setLayout: (layout: WidgetInstance[]) => void;

  // Widget operations
  addWidget: (widget: Omit<WidgetInstance, 'id' | 'position'>) => void;
  removeWidget: (widgetInstanceId: string) => void;
  resizeWidget: (widgetInstanceId: string, size: WidgetSize) => void;
  moveWidget: (widgetInstanceId: string, newIndex: number) => void;

  // Dirty flag to track unsaved changes
  isDirty: boolean;
  setDirty: (value: boolean) => void;
};

// Generate unique ID for widget instances
function generateWidgetInstanceId(): string {
  return `widget-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Generate default position for new widgets
function getNextPosition(layout: WidgetInstance[]): { x: number; y: number; w: number; h: number } {
  // Simple placement: stack widgets vertically
  const maxY = layout.reduce((max, w) => Math.max(max, w.position.y + w.position.h), 0);
  return { x: 0, y: maxY, w: 1, h: 1 };
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Edit mode
  isEditMode: false,
  setEditMode: (value) => set({ isEditMode: value }),
  toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),

  // Add widget modal
  isAddWidgetModalOpen: false,
  openAddWidgetModal: () => set({ isAddWidgetModalOpen: true }),
  closeAddWidgetModal: () => set({ isAddWidgetModalOpen: false }),

  // Layout
  layout: [],
  setLayout: (layout) => set({ layout, isDirty: false }),

  // Widget operations
  addWidget: (widget) => {
    const currentLayout = get().layout;
    const newWidget: WidgetInstance = {
      ...widget,
      id: generateWidgetInstanceId(),
      position: getNextPosition(currentLayout),
    };
    set({ layout: [...currentLayout, newWidget], isDirty: true });
  },

  removeWidget: (widgetInstanceId) => {
    set((state) => ({
      layout: state.layout.filter((w) => w.id !== widgetInstanceId),
      isDirty: true,
    }));
  },

  resizeWidget: (widgetInstanceId, size) => {
    set((state) => ({
      layout: state.layout.map((w) =>
        w.id === widgetInstanceId ? { ...w, size } : w
      ),
      isDirty: true,
    }));
  },

  moveWidget: (widgetInstanceId, newIndex) => {
    set((state) => {
      const layout = [...state.layout];
      const currentIndex = layout.findIndex((w) => w.id === widgetInstanceId);
      if (currentIndex === -1 || currentIndex === newIndex) return state;

      const [widget] = layout.splice(currentIndex, 1);
      layout.splice(newIndex, 0, widget);

      return { layout, isDirty: true };
    });
  },

  // Dirty flag
  isDirty: false,
  setDirty: (value) => set({ isDirty: value }),
}));
