'use client';

import { useState } from 'react';
import { Archive } from 'lucide-react';
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
import { formatPHP } from '@/lib/format';
import { toast } from 'sonner';
import { archiveAccount } from '@/server/actions/accounts';

type ArchiveAccountDialogProps = {
  accountId: string;
  accountName: string;
  currentBalance: number; // in centavos
};

export function ArchiveAccountDialog({
  accountId,
  accountName,
  currentBalance,
}: ArchiveAccountDialogProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [open, setOpen] = useState(false);

  const handleArchive = async () => {
    setIsArchiving(true);

    try {
      const result = await archiveAccount({ accountId });

      if (!result.success) {
        toast.error('Failed to archive account', {
          description: result.error || 'An unexpected error occurred.',
        });
        return;
      }

      toast.success('Account archived', {
        description: `${accountName} has been archived and hidden from your accounts list.`,
      });
      setOpen(false);
    } catch (error) {
      toast.error('Failed to archive account', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-amber-600 hover:bg-amber-50"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click from firing
          }}
        >
          <Archive className="h-4 w-4" />
          <span className="sr-only">Archive account</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive Account?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to archive this account? It will be hidden from your accounts
            list but all transaction data will be preserved.
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900 font-medium">{accountName}</p>
              <p className="text-sm text-gray-600 mt-1">
                Current Balance: {formatPHP(currentBalance)}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleArchive();
            }}
            disabled={isArchiving}
            className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-600"
          >
            {isArchiving ? 'Archiving...' : 'Archive'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
