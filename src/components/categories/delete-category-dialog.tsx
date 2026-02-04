'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

type DeleteCategoryDialogProps = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  type: 'expense' | 'income';
  small?: boolean;
};

export function DeleteCategoryDialog({
  categoryId,
  categoryName,
  categoryIcon,
  type,
  small = false,
}: DeleteCategoryDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // TODO: Implement deleteCategory server action (Task 7)
      // const result = await deleteCategory({ categoryId });

      // Placeholder for now
      await new Promise((resolve) => setTimeout(resolve, 500));
      const result = { success: false, error: 'deleteCategory not yet implemented' };

      if (!result.success) {
        toast.error('Failed to delete category', {
          description: result.error || 'An unexpected error occurred.',
        });
        return;
      }

      toast.success('Category deleted', {
        description: `${categoryName} has been permanently deleted.`,
      });
      setOpen(false);
    } catch (error) {
      toast.error('Failed to delete category', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={
            small
              ? 'h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50'
              : 'h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50'
          }
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Trash2 className={small ? 'h-3 w-3' : 'h-4 w-4'} />
          <span className="sr-only">Delete category</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this category? This action cannot be undone.
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{categoryIcon || '📁'}</span>
                <div>
                  <p className="text-sm text-gray-900 font-medium">{categoryName}</p>
                  <p className="text-xs text-gray-600 capitalize">{type} category</p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
