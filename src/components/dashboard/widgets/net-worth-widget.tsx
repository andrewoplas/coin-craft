'use client';

import { useEffect, useState } from 'react';
import { type WidgetProps } from '@/modules/types';
import { formatPHP } from '@/lib/format';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

type NetWorthData = {
  netWorth: number;
  change?: number; // percentage change from last month
};

export function NetWorthWidget({ size }: WidgetProps) {
  const [data, setData] = useState<NetWorthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const stats = await response.json();
          setData({ netWorth: stats.netWorth });
        }
      } catch (error) {
        console.error('Failed to load net worth:', error);
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

  const isPositive = (data?.netWorth || 0) >= 0;

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Wallet className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">Net Worth</span>
      </div>
      <p className={`text-2xl md:text-3xl font-bold ${isPositive ? 'text-foreground' : 'text-red-500'}`}>
        {formatPHP(data?.netWorth || 0)}
      </p>
      {data?.change !== undefined && size !== 'S' && (
        <div className={`flex items-center gap-1 mt-2 text-sm ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {data.change >= 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>{Math.abs(data.change).toFixed(1)}% from last month</span>
        </div>
      )}
    </div>
  );
}
