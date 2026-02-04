'use client';

import { useEffect, useState } from 'react';
import { type WidgetProps } from '@/modules/types';
import { fetchActiveEnvelopes } from '@/server/actions/allocations';
import { formatPHP, fromCentavos } from '@/lib/format';
import { PiggyBank, TrendingUp, Wallet } from 'lucide-react';

type Envelope = {
  id: string;
  name: string;
  icon: string | null;
  currentAmount: number;
  targetAmount: number | null;
};

export function AllocationSummaryWidget({ size }: WidgetProps) {
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [envelopeCount, setEnvelopeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = await fetchActiveEnvelopes();
      if (result.success) {
        const envelopes = result.data;
        const allocated = envelopes.reduce((sum, env) => sum + (env.targetAmount || 0), 0);
        const spent = envelopes.reduce((sum, env) => sum + env.currentAmount, 0);
        setTotalAllocated(allocated);
        setTotalSpent(spent);
        setEnvelopeCount(envelopes.length);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const remaining = Math.max(0, totalAllocated - totalSpent);
  const percentUsed = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  if (size === 'S') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Remaining</span>
          <span className="text-lg font-bold">{formatPHP(remaining)}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${percentUsed >= 80 ? 'bg-red-500' : percentUsed >= 60 ? 'bg-amber-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {percentUsed.toFixed(0)}% used of {formatPHP(totalAllocated)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Wallet className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-lg font-bold">{formatPHP(totalAllocated)}</p>
          <p className="text-xs text-muted-foreground">Allocated</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-lg font-bold">{formatPHP(totalSpent)}</p>
          <p className="text-xs text-muted-foreground">Spent</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <PiggyBank className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-lg font-bold">{formatPHP(remaining)}</p>
          <p className="text-xs text-muted-foreground">Remaining</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1 text-sm">
          <span className="text-muted-foreground">{envelopeCount} envelope{envelopeCount !== 1 ? 's' : ''}</span>
          <span className="font-medium">{percentUsed.toFixed(0)}% used</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${percentUsed >= 80 ? 'bg-red-500' : percentUsed >= 60 ? 'bg-amber-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
