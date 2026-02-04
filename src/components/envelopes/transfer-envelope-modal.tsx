"use client";

import { useState } from 'react';
import { useTransferEnvelopeStore } from '@/stores/transfer-envelope-store';
import { transferBetweenEnvelopes } from '@/server/actions/envelopes';
import { Envelope } from '@/server/queries/allocations';
import { fromCentavos } from '@/lib/format';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type TransferEnvelopeModalProps = {
  envelopes: Envelope[];
};

export const TransferEnvelopeModal = ({ envelopes }: TransferEnvelopeModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = useTransferEnvelopeStore((state) => state.isOpen);
  const close = useTransferEnvelopeStore((state) => state.close);
  const reset = useTransferEnvelopeStore((state) => state.reset);

  const sourceEnvelopeId = useTransferEnvelopeStore((state) => state.sourceEnvelopeId);
  const targetEnvelopeId = useTransferEnvelopeStore((state) => state.targetEnvelopeId);
  const amount = useTransferEnvelopeStore((state) => state.amount);

  const setSourceEnvelopeId = useTransferEnvelopeStore((state) => state.setSourceEnvelopeId);
  const setTargetEnvelopeId = useTransferEnvelopeStore((state) => state.setTargetEnvelopeId);
  const setAmount = useTransferEnvelopeStore((state) => state.setAmount);

  // All envelopes are already active (filtered by query)
  // Get source envelope for budget display
  const sourceEnvelope = envelopes.find((e) => e.id === sourceEnvelopeId);
  const sourceBudget = sourceEnvelope?.targetAmount || 0;
  const sourceSpent = sourceEnvelope?.currentAmount || 0;
  const sourceRemaining = sourceBudget - sourceSpent;

  // Filter target options (exclude source)
  const targetOptions = envelopes.filter((e) => e.id !== sourceEnvelopeId);

  const handleClose = () => {
    close();
    reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sourceEnvelopeId || !targetEnvelopeId) {
      toast.error('Please select both source and target envelopes');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    setIsSubmitting(true);

    const result = await transferBetweenEnvelopes({
      sourceEnvelopeId,
      targetEnvelopeId,
      amount: amountNum,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success('Budget transferred successfully');
      handleClose();
    } else {
      toast.error(result.error || 'Failed to transfer budget');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Budget</DialogTitle>
          <DialogDescription>
            Move budget allocation from one envelope to another
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source Envelope */}
          <div className="space-y-2">
            <Label htmlFor="source">From Envelope</Label>
            <Select
              value={sourceEnvelopeId}
              onValueChange={setSourceEnvelopeId}
            >
              <SelectTrigger id="source">
                <SelectValue placeholder="Select source envelope" />
              </SelectTrigger>
              <SelectContent>
                {envelopes.map((envelope) => (
                  <SelectItem key={envelope.id} value={envelope.id}>
                    {envelope.icon} {envelope.name} (₱{fromCentavos(envelope.targetAmount || 0)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sourceEnvelope && (
              <p className="text-sm text-muted-foreground">
                Budget: ₱{fromCentavos(sourceBudget)} •
                Remaining: ₱{fromCentavos(sourceRemaining)}
              </p>
            )}
          </div>

          {/* Transfer Icon */}
          <div className="flex justify-center">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Target Envelope */}
          <div className="space-y-2">
            <Label htmlFor="target">To Envelope</Label>
            <Select
              value={targetEnvelopeId}
              onValueChange={setTargetEnvelopeId}
              disabled={!sourceEnvelopeId}
            >
              <SelectTrigger id="target">
                <SelectValue placeholder="Select target envelope" />
              </SelectTrigger>
              <SelectContent>
                {targetOptions.map((envelope) => (
                  <SelectItem key={envelope.id} value={envelope.id}>
                    {envelope.icon} {envelope.name} (₱{fromCentavos(envelope.targetAmount || 0)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₱)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            {sourceEnvelope && parseFloat(amount) > fromCentavos(sourceBudget) && (
              <p className="text-sm text-destructive">
                Amount exceeds source budget
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !sourceEnvelopeId ||
                !targetEnvelopeId ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > fromCentavos(sourceBudget)
              }
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transferring...
                </>
              ) : (
                'Transfer'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
