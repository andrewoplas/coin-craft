'use client';

import { useEffect, useState } from 'react';
import { type FormExtensionProps } from '@/modules/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchActiveEnvelopes } from '@/server/actions/allocations';
import { useQuickAddStore } from '@/stores/quick-add-store';
import { fromCentavos } from '@/lib/format';

type Envelope = {
  id: string;
  name: string;
  icon: string | null;
  currentAmount: number;
  targetAmount: number | null;
  categoryIds: string[] | null;
};

export function WalletPicker({ value, onChange }: FormExtensionProps) {
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedCategory = useQuickAddStore((state) => state.selectedCategory);

  useEffect(() => {
    // Fetch envelopes on mount
    async function loadEnvelopes() {
      try {
        const result = await fetchActiveEnvelopes();

        if (result.success) {
          setEnvelopes(result.data);

          // Auto-select if category is linked to an envelope
          if (selectedCategory && !value) {
            const linkedEnvelope = result.data.find(
              (env) => env.categoryIds && env.categoryIds.includes(selectedCategory.id)
            );
            if (linkedEnvelope) {
              onChange(linkedEnvelope.id);
            }
          }
        } else {
          console.error('Failed to fetch envelopes:', result.error);
        }
      } catch (error) {
        console.error('Failed to fetch envelopes:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEnvelopes();
  }, [selectedCategory, value, onChange]);

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Which wallet?</label>
        <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
      </div>
    );
  }

  if (envelopes.length === 0) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-500">Which wallet?</label>
        <p className="text-sm text-gray-400">No wallets available. Create one in Envelopes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="wallet-picker" className="text-sm font-medium">
        Which wallet?
      </label>
      <Select value={value as string | undefined} onValueChange={onChange}>
        <SelectTrigger id="wallet-picker">
          <SelectValue placeholder="Select a wallet..." />
        </SelectTrigger>
        <SelectContent>
          {envelopes.map((envelope) => {
            const current = fromCentavos(envelope.currentAmount);
            const target = envelope.targetAmount ? fromCentavos(envelope.targetAmount) : null;
            const remaining = target ? target - current : null;

            return (
              <SelectItem key={envelope.id} value={envelope.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {envelope.icon && <span>{envelope.icon}</span>}
                    <span>{envelope.name}</span>
                  </div>
                  {remaining !== null && (
                    <span className="text-xs text-gray-500">
                      ₱{remaining.toFixed(2)} left
                    </span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
