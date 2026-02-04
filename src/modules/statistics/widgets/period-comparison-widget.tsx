'use client';

import { useEffect, useState } from 'react';
import { formatPHP } from '@/lib/format';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import type { WidgetProps } from '@/modules/types';

type ComparisonData = {
  currentPeriod: {
    income: number;
    expenses: number;
    netCashFlow: number;
  };
  changes: {
    income: number;
    expenses: number;
    netCashFlow: number;
  };
};

export function PeriodComparisonWidget({ size }: WidgetProps) {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/statistics/period-comparison');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <span className="text-2xl mb-1">📊</span>
        <span className="text-sm">No comparison data</span>
      </div>
    );
  }

  const renderChange = (change: number, inverse: boolean = false) => {
    const isPositive = inverse ? change < 0 : change > 0;
    const isNegative = inverse ? change > 0 : change < 0;

    if (Math.abs(change) < 0.1) {
      return <MinusIcon className="h-3 w-3 text-muted-foreground" />;
    }

    return (
      <span
        className={`flex items-center gap-0.5 text-xs ${
          isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : ''
        }`}
      >
        {isPositive ? (
          <ArrowUpIcon className="h-3 w-3" />
        ) : (
          <ArrowDownIcon className="h-3 w-3" />
        )}
        {Math.abs(change).toFixed(0)}%
      </span>
    );
  };

  // Small size: compact layout
  if (size === 'S') {
    return (
      <div className="h-full flex flex-col justify-center space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Net Flow</span>
          <span
            className={`text-sm font-semibold ${
              data.currentPeriod.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatPHP(data.currentPeriod.netCashFlow)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">vs last period</span>
          {renderChange(data.changes.netCashFlow)}
        </div>
      </div>
    );
  }

  // Medium/Large size: full layout
  return (
    <div className="h-full flex flex-col justify-center space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Income</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-green-600">
            {formatPHP(data.currentPeriod.income)}
          </span>
          {renderChange(data.changes.income)}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Expenses</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-red-600">
            {formatPHP(data.currentPeriod.expenses)}
          </span>
          {renderChange(data.changes.expenses, true)}
        </div>
      </div>
      <div className="border-t pt-2 flex items-center justify-between">
        <span className="text-sm font-medium">Net Cash Flow</span>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-bold ${
              data.currentPeriod.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatPHP(data.currentPeriod.netCashFlow)}
          </span>
          {renderChange(data.changes.netCashFlow)}
        </div>
      </div>
    </div>
  );
}
