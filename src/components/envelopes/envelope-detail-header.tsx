'use client';

import { ArrowLeft, ArrowLeftRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { fromCentavos } from '@/lib/format';
import { useTransferEnvelopeStore } from '@/stores/transfer-envelope-store';
import type { EnvelopeDetail } from '@/server/queries/envelopes';

type EnvelopeDetailHeaderProps = {
  envelope: EnvelopeDetail;
};

export function EnvelopeDetailHeader({ envelope }: EnvelopeDetailHeaderProps) {
  const router = useRouter();
  const openTransferModal = useTransferEnvelopeStore((state) => state.open);

  const spent = envelope.currentAmount;
  const target = envelope.targetAmount || 0;
  const remaining = Math.max(0, target - spent);
  const percentSpent = target > 0 ? (spent / target) * 100 : 0;

  // Progress bar color based on percentage
  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'bg-red-500';
    if (percent >= 60) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const handleTransfer = () => {
    openTransferModal(envelope.id);
  };

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/modules/envelopes')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Envelopes
      </Button>

      {/* Envelope header */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
              style={{ backgroundColor: envelope.color || '#3B82F6' }}
            >
              {envelope.icon || '💰'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{envelope.name}</h1>
              {envelope.period && envelope.period !== 'none' && (
                <p className="text-sm text-muted-foreground">
                  {envelope.period === 'weekly' && 'Weekly'}
                  {envelope.period === 'monthly' && 'Monthly'}
                  {envelope.period === 'yearly' && 'Yearly'}
                  {envelope.periodStart && ` • Started ${format(parseISO(envelope.periodStart), 'MMM d, yyyy')}`}
                </p>
              )}
            </div>
          </div>

          {/* Transfer button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleTransfer}
            className="gap-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Transfer
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">
              ₱{fromCentavos(spent)} / ₱{fromCentavos(target)}
            </span>
            <span className="text-muted-foreground">
              {percentSpent.toFixed(0)}% spent
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all ${getProgressColor(percentSpent)}`}
              style={{ width: `${Math.min(100, percentSpent)}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            ₱{fromCentavos(remaining)} remaining
          </div>
        </div>
      </div>
    </div>
  );
}
