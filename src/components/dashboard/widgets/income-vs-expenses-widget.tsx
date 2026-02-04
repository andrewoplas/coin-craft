'use client';

import { useEffect, useState } from 'react';
import { type WidgetProps } from '@/modules/types';
import { fromCentavos } from '@/lib/format';
import { COLORS } from '@/lib/constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';

type MonthData = {
  month: string;
  income: number;
  expenses: number;
};

export function IncomeVsExpensesWidget({ size }: WidgetProps) {
  const [data, setData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/dashboard/income-vs-expenses');
        if (response.ok) {
          const monthData = await response.json();
          setData(monthData);
        }
      } catch (error) {
        console.error('Failed to load income vs expenses:', error);
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

  const hasData = data.some((d) => d.income > 0 || d.expenses > 0);

  if (!hasData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <BarChart3 className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No data yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Add transactions to see your income vs expenses
        </p>
      </div>
    );
  }

  // Convert centavos to pesos for display
  const chartData = data.map((d) => ({
    month: d.month,
    Income: fromCentavos(d.income),
    Expenses: fromCentavos(d.expenses),
  }));

  const formatTooltipValue = (value: number | string | (number | string)[] | undefined) => {
    const numValue = typeof value === 'number' ? value : 0;
    return `₱${numValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="h-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          {size !== 'S' && (
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
            />
          )}
          <Tooltip
            formatter={formatTooltipValue}
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          {size !== 'S' && <Legend wrapperStyle={{ fontSize: '12px' }} />}
          <Bar dataKey="Income" fill={COLORS.income} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Expenses" fill={COLORS.expense} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
