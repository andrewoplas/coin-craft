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
import { GoalContribution, GoalDetail } from '@/server/queries/goals';
import { fromCentavos } from '@/lib/format';
import { format, parseISO, eachMonthOfInterval, startOfMonth, subMonths } from 'date-fns';

type SavingsProgressChartProps = {
  contributions: GoalContribution[];
  goal: GoalDetail;
};

export function SavingsProgressChart({ contributions, goal }: SavingsProgressChartProps) {
  const chartData = useMemo(() => {
    // Get date range: from goal creation to now (or last 6 months, whichever is shorter)
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);
    const startDate = goal.createdAt > sixMonthsAgo ? goal.createdAt : sixMonthsAgo;

    const months = eachMonthOfInterval({
      start: startOfMonth(startDate),
      end: startOfMonth(now),
    });

    // Calculate cumulative savings per month
    let cumulativeAmount = 0;
    const data = months.map((month) => {
      const monthStr = format(month, 'yyyy-MM');

      // Sum contributions for this month
      const monthContributions = contributions.filter((c) => {
        const contribMonth = format(parseISO(c.date), 'yyyy-MM');
        return contribMonth <= monthStr;
      });

      cumulativeAmount = monthContributions.reduce(
        (sum, c) => sum + c.contributionAmount,
        0
      );

      return {
        month: format(month, 'MMM yyyy'),
        saved: fromCentavos(cumulativeAmount),
        target: fromCentavos(goal.targetAmount || 0),
      };
    });

    return data;
  }, [contributions, goal]);

  if (chartData.length < 2) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Savings Progress</h3>
        <div className="h-[200px] flex items-center justify-center text-gray-500">
          Add more contributions to see your progress chart
        </div>
      </div>
    );
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₱${(value / 1000).toFixed(0)}K`;
    return `₱${value}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Savings Progress</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="savedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [`₱${Number(value || 0).toLocaleString()}`, 'Saved']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            {/* Target line */}
            <Area
              type="monotone"
              dataKey="target"
              stroke="#9CA3AF"
              strokeDasharray="5 5"
              fill="none"
              name="Target"
            />
            {/* Saved area */}
            <Area
              type="monotone"
              dataKey="saved"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#savedGradient)"
              name="Saved"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600">Saved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-gray-400" style={{ borderTop: '2px dashed #9CA3AF' }}></div>
          <span className="text-gray-600">Target</span>
        </div>
      </div>
    </div>
  );
}
