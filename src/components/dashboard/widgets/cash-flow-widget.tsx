'use client';

import { useEffect, useState } from 'react';
import { type WidgetProps } from '@/modules/types';
import { formatPHP } from '@/lib/format';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { COLORS } from '@/lib/constants';

type CashFlowData = {
  totalIncome: number;
  totalExpenses: number;
  cashFlow: number;
};

export function CashFlowWidget({ size }: WidgetProps) {
  const [data, setData] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const stats = await response.json();
          setData({
            totalIncome: stats.totalIncome,
            totalExpenses: stats.totalExpenses,
            cashFlow: stats.cashFlow,
          });
        }
      } catch (error) {
        console.error('Failed to load cash flow:', error);
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

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Unable to load data</p>
      </div>
    );
  }

  const isPositive = data.cashFlow >= 0;

  if (size === 'S') {
    return (
      <div className="h-full flex flex-col justify-center">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <span className="text-xs font-medium uppercase tracking-wide">Cash Flow</span>
        </div>
        <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{formatPHP(data.cashFlow)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">This month</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-center space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium uppercase tracking-wide">Income</span>
          </div>
          <p className="text-xl font-semibold" style={{ color: COLORS.income }}>
            {formatPHP(data.totalIncome)}
          </p>
        </div>

        <ArrowRight className="h-5 w-5 text-muted-foreground" />

        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <span className="text-xs font-medium uppercase tracking-wide">Expenses</span>
          </div>
          <p className="text-xl font-semibold" style={{ color: COLORS.expense }}>
            {formatPHP(data.totalExpenses)}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Net Cash Flow</span>
          <span className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{formatPHP(data.cashFlow)}
          </span>
        </div>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          {data.totalIncome > 0 && (
            <div
              className={`h-full transition-all ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
              style={{
                width: `${Math.min(100, (data.totalIncome > 0 ? (data.totalIncome - data.totalExpenses) / data.totalIncome * 100 : 0) + 50)}%`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
