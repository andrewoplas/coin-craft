'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';
import { fromCentavos } from '@/lib/format';
import type { EnvelopeTransaction } from '@/server/queries/envelopes';

type DailySpendingChartProps = {
  transactions: EnvelopeTransaction[];
  period: string | null;
  periodStart: string | null;
};

type ChartDataPoint = {
  date: string;
  dateLabel: string;
  amount: number;
  cumulativeAmount: number;
};

function aggregateDailySpending(
  transactions: EnvelopeTransaction[],
  daysToShow: number
): ChartDataPoint[] {
  // Get date range (last N days)
  const today = new Date();
  const startDate = subDays(today, daysToShow - 1);

  // Generate all dates in range
  const dateRange = eachDayOfInterval({ start: startDate, end: today });

  // Aggregate spending by date
  const spendingByDate = new Map<string, number>();

  for (const tx of transactions) {
    const txDate = parseISO(tx.date);
    const dateKey = format(txDate, 'yyyy-MM-dd');

    // Only include transactions within the date range
    if (txDate >= startDate && txDate <= today) {
      const current = spendingByDate.get(dateKey) || 0;
      spendingByDate.set(dateKey, current + tx.allocationAmount);
    }
  }

  // Build chart data with all dates (fill zeros for days with no spending)
  let cumulative = 0;
  const chartData: ChartDataPoint[] = dateRange.map((date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const amount = spendingByDate.get(dateKey) || 0;
    cumulative += amount;

    return {
      date: dateKey,
      dateLabel: format(date, 'MMM d'),
      amount,
      cumulativeAmount: cumulative,
    };
  });

  return chartData;
}

export function DailySpendingChart({
  transactions,
  period,
}: DailySpendingChartProps) {
  // Determine number of days to show based on period
  const daysToShow = useMemo(() => {
    if (period === 'weekly') return 7;
    if (period === 'monthly') return 30;
    return 30; // Default to 30 days
  }, [period]);

  const chartData = useMemo(
    () => aggregateDailySpending(transactions, daysToShow),
    [transactions, daysToShow]
  );

  const totalSpent = useMemo(
    () => chartData[chartData.length - 1]?.cumulativeAmount || 0,
    [chartData]
  );

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Daily Spending</h2>
        <p className="text-sm text-muted-foreground">
          Last {daysToShow} days • Total: ₱{fromCentavos(totalSpent)}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="dateLabel"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            interval="preserveStartEnd"
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => `₱${fromCentavos(value)}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as ChartDataPoint;
                return (
                  <div className="rounded-lg border bg-card p-3 shadow-lg">
                    <p className="text-sm font-medium">{data.dateLabel}</p>
                    <p className="text-sm text-muted-foreground">
                      Daily: ₱{fromCentavos(data.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total: ₱{fromCentavos(data.cumulativeAmount)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#EF4444"
            strokeWidth={2}
            fill="url(#colorAmount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
