'use client';

import { useState } from 'react';
import { EyeOff } from 'lucide-react';
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
import { hideCategory } from '@/server/actions/categories';

type HideCategoryDialogProps = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  type: 'expense' | 'income';
  small?: boolean;
};

export function HideCategoryDialog({
  categoryId,
  categoryName,
  categoryIcon,
  type,
  small = false,
}: HideCategoryDialogProps) {
  const [isHiding, setIsHiding] = useState(false);
  const [open, setOpen] = useState(false);

  const handleHide = async () => {
    setIsHiding(true);

    try {
      const result = await hideCategory({ categoryId });

      if (!result.success) {
        toast.error('Failed to hide category', {
          description: result.error || 'An unexpected error occurred.',
        });
        return;
      }

      toast.success('Category hidden', {
        description: `${categoryName} has been hidden from your categories list.`,
      });
      setOpen(false);
    } catch (error) {
      toast.error('Failed to hide category', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsHiding(false);
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
              ? 'h-6 w-6 text-gray-400 hover:text-amber-600 hover:bg-amber-50'
              : 'h-8 w-8 text-gray-400 hover:text-amber-600 hover:bg-amber-50'
          }
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <EyeOff className={small ? 'h-3 w-3' : 'h-4 w-4'} />
          <span className="sr-only">Hide category</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hide Category?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to hide this system category? It will be hidden from your
            categories list but can be unhidden later if needed.
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{categoryIcon || '📁'}</span>
                <div>
                  <p className="text-sm text-gray-900 font-medium">{categoryName}</p>
                  <p className="text-xs text-gray-600 capitalize">{type} category · System</p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isHiding}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleHide();
            }}
            disabled={isHiding}
            className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-600"
          >
            {isHiding ? 'Hiding...' : 'Hide'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
