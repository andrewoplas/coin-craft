'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatPHP, fromCentavos } from '@/lib/format';
import { COLORS } from '@/lib/constants';
import type { WidgetProps } from '@/modules/types';

type TrendData = {
  month: string;
  monthLabel: string;
  totalSpending: number;
};

export function TrendChartWidget({ size }: WidgetProps) {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/statistics/trends');
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

  if (data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <span className="text-2xl mb-1">📈</span>
        <span className="text-sm">No trend data</span>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    month: d.monthLabel,
    spending: fromCentavos(d.totalSpending),
  }));

  // For small size, show compact version
  if (size === 'S') {
    const latestMonth = data[data.length - 1];
    const previousMonth = data[data.length - 2];
    const change = previousMonth
      ? ((latestMonth.totalSpending - previousMonth.totalSpending) /
          previousMonth.totalSpending) *
        100
      : 0;

    return (
      <div className="h-full flex flex-col justify-center">
        <p className="text-sm text-muted-foreground">This Month</p>
        <p className="text-2xl font-bold text-red-600">
          {formatPHP(latestMonth.totalSpending)}
        </p>
        <p
          className={`text-xs ${
            change <= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {change <= 0 ? '↓' : '↑'} {Math.abs(change).toFixed(1)}% vs last month
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value) => formatPHP(Number(value || 0) * 100)}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="spending"
            stroke={COLORS.expense}
            strokeWidth={2}
            dot={{ fill: COLORS.expense, strokeWidth: 0, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
