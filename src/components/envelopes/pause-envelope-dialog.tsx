'use client';

import { useState } from 'react';
import { PauseCircle } from 'lucide-react';
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
import { pauseEnvelope } from '@/server/actions/envelopes';

type PauseEnvelopeDialogProps = {
  envelopeId: string;
  envelopeName: string;
  currentAmount: number; // in centavos
  targetAmount: number; // in centavos
};

export function PauseEnvelopeDialog({
  envelopeId,
  envelopeName,
  currentAmount,
  targetAmount,
}: PauseEnvelopeDialogProps) {
  const [isPausing, setIsPausing] = useState(false);
  const [open, setOpen] = useState(false);

  const handlePause = async () => {
    setIsPausing(true);

    try {
      const result = await pauseEnvelope({ envelopeId });

      if (!result.success) {
        toast.error('Failed to pause envelope', {
          description: result.error || 'An unexpected error occurred.',
        });
        return;
      }

      toast.success('Envelope paused', {
        description: `${envelopeName} has been paused and hidden from your envelopes list.`,
      });
      setOpen(false);
    } catch (error) {
      toast.error('Failed to pause envelope', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsPausing(false);
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
          <PauseCircle className="h-4 w-4" />
          <span className="sr-only">Pause envelope</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Pause Envelope?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to pause this envelope? It will be hidden from your envelopes
            list but all transaction data will be preserved.
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900 font-medium">{envelopeName}</p>
              <p className="text-sm text-gray-600 mt-1">
                Current: {formatPHP(currentAmount)} / {formatPHP(targetAmount)}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPausing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handlePause();
            }}
            disabled={isPausing}
            className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-600"
          >
            {isPausing ? 'Pausing...' : 'Pause'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
