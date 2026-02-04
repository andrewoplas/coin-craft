import { create } from 'zustand';
import type { CategoryType } from '@/lib/types';
import type { CategoryWithSubcategories } from '@/server/queries/categories';

// Union type for editing either main category or subcategory
type EditableCategory = CategoryWithSubcategories | {
  id: string;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string | null;
  parentId: string | null;
};

type EditCategoryState = {
  // Modal state
  isOpen: boolean;

  // Category being edited
  categoryId: string | null;

  // Read-only display fields (cannot be changed after creation)
  type: CategoryType;
  parentId: string | null;
  parentName: string | null; // For display purposes

  // Editable fields
  name: string;
  icon: string;
  color: string;

  // Actions
  openForEdit: (category: EditableCategory, parentName?: string) => void;
  close: () => void;
  setName: (name: string) => void;
  setIcon: (icon: string) => void;
  setColor: (color: string) => void;
  reset: () => void;
};

const initialState = {
  isOpen: false,
  categoryId: null,
  type: 'expense' as CategoryType,
  parentId: null,
  parentName: null,
  name: '',
  icon: '',
  color: '',
};

export const useEditCategoryStore = create<EditCategoryState>((set) => ({
  ...initialState,

  openForEdit: (category: EditableCategory, parentName?: string) => {
    set({
      isOpen: true,
      categoryId: category.id,
      type: category.type,
      parentId: category.parentId,
      parentName: parentName || null,
      name: category.name,
      icon: category.icon || '',
      color: category.color || '',
    });
  },

  close: () => {
    set({ isOpen: false });
  },

  setName: (name: string) => {
    set({ name });
  },

  setIcon: (icon: string) => {
    set({ icon });
  },

  setColor: (color: string) => {
    set({ color });
  },

  reset: () => {
    set(initialState);
  },
}));
