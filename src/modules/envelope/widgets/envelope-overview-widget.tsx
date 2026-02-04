'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { type WidgetProps } from '@/modules/types';
import { fetchActiveEnvelopes } from '@/server/actions/allocations';
import { fromCentavos } from '@/lib/format';
import { Wallet2 } from 'lucide-react';

type Envelope = {
  id: string;
  name: string;
  icon: string | null;
  currentAmount: number;
  targetAmount: number | null;
};

export function EnvelopeOverviewWidget({ size }: WidgetProps) {
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEnvelopes() {
      const result = await fetchActiveEnvelopes();
      if (result.success) {
        setEnvelopes(result.data);
      }
      setLoading(false);
    }
    loadEnvelopes();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (envelopes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <Wallet2 className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No envelopes yet</p>
        <Link
          href="/modules/envelopes"
          className="text-sm text-primary hover:underline mt-1"
        >
          Create one
        </Link>
      </div>
    );
  }

  // Determine how many to show based on size
  const maxItems = size === 'S' ? 3 : size === 'M' ? 5 : 8;
  const displayEnvelopes = envelopes.slice(0, maxItems);

  return (
    <div className="space-y-3">
      {displayEnvelopes.map((envelope) => {
        const target = envelope.targetAmount || 0;
        const spent = envelope.currentAmount;
        const percentage = target > 0 ? (spent / target) * 100 : 0;

        const getProgressColor = (percent: number) => {
          if (percent >= 80) return 'bg-red-500';
          if (percent >= 60) return 'bg-amber-500';
          return 'bg-green-500';
        };

        return (
          <Link
            key={envelope.id}
            href={`/modules/envelopes/${envelope.id}`}
            className="block hover:bg-muted/50 rounded-lg p-2 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{envelope.icon || '💰'}</span>
                <span className="text-sm font-medium truncate">{envelope.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                ₱{fromCentavos(Math.max(0, target - spent))} left
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getProgressColor(percentage)}`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
          </Link>
        );
      })}
      {envelopes.length > maxItems && (
        <Link
          href="/modules/envelopes"
          className="block text-center text-sm text-primary hover:underline"
        >
          View all {envelopes.length} envelopes
        </Link>
      )}
    </div>
  );
}
