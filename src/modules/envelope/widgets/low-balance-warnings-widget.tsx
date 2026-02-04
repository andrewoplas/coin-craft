'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { type WidgetProps } from '@/modules/types';
import { fetchActiveEnvelopes } from '@/server/actions/allocations';
import { fromCentavos } from '@/lib/format';
import { AlertTriangle, CheckCircle } from 'lucide-react';

type Envelope = {
  id: string;
  name: string;
  icon: string | null;
  currentAmount: number;
  targetAmount: number | null;
};

export function LowBalanceWarningsWidget({ size }: WidgetProps) {
  const [lowBalanceEnvelopes, setLowBalanceEnvelopes] = useState<Envelope[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEnvelopes() {
      const result = await fetchActiveEnvelopes();
      if (result.success) {
        // Filter envelopes that are > 80% spent
        const warnings = result.data.filter((env) => {
          const target = env.targetAmount || 0;
          if (target === 0) return false;
          const percentage = (env.currentAmount / target) * 100;
          return percentage >= 80;
        });
        // Sort by percentage spent (highest first)
        warnings.sort((a, b) => {
          const pctA = ((a.currentAmount) / (a.targetAmount || 1)) * 100;
          const pctB = ((b.currentAmount) / (b.targetAmount || 1)) * 100;
          return pctB - pctA;
        });
        setLowBalanceEnvelopes(warnings);
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

  if (lowBalanceEnvelopes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
        <p className="text-sm font-medium text-green-700">All good!</p>
        <p className="text-xs text-muted-foreground mt-1">
          No envelopes need attention
        </p>
      </div>
    );
  }

  // Determine how many to show based on size
  const maxItems = size === 'S' ? 3 : size === 'M' ? 4 : 6;
  const displayEnvelopes = lowBalanceEnvelopes.slice(0, maxItems);

  return (
    <div className="space-y-3">
      {displayEnvelopes.map((envelope) => {
        const target = envelope.targetAmount || 0;
        const spent = envelope.currentAmount;
        const remaining = Math.max(0, target - spent);
        const percentage = target > 0 ? (spent / target) * 100 : 0;
        const isOverBudget = percentage >= 100;

        return (
          <Link
            key={envelope.id}
            href={`/modules/envelopes/${envelope.id}`}
            className="flex items-center gap-3 p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
          >
            <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${isOverBudget ? 'text-red-600' : 'text-amber-500'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span>{envelope.icon || '💰'}</span>
                <span className="text-sm font-medium truncate">{envelope.name}</span>
              </div>
              <p className={`text-xs ${isOverBudget ? 'text-red-600' : 'text-amber-600'}`}>
                {isOverBudget
                  ? `₱${fromCentavos(spent - target)} over budget`
                  : `Only ₱${fromCentavos(remaining)} left (${(100 - percentage).toFixed(0)}%)`}
              </p>
            </div>
          </Link>
        );
      })}
      {lowBalanceEnvelopes.length > maxItems && (
        <p className="text-xs text-center text-muted-foreground">
          +{lowBalanceEnvelopes.length - maxItems} more warnings
        </p>
      )}
    </div>
  );
}
