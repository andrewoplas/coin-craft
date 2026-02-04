'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPHP, fromCentavos, formatDateString } from '@/lib/format';
import { COLORS } from '@/lib/constants';
import type { DailySpending, TrendData } from '@/server/queries/statistics';

type TrendsTabProps = {
  dailySpending: DailySpending[];
  spendingTrends: TrendData[];
  averageDailySpend: number;
  dateFrom: string;
  dateTo: string;
};

export function TrendsTab({
  dailySpending,
  spendingTrends,
  averageDailySpend,
  dateFrom,
  dateTo,
}: TrendsTabProps) {
  // Calculate total spending for the period
  const totalSpending = dailySpending.reduce((sum, day) => sum + day.amount, 0);

  // Calculate total transactions for 6-month trend
  const totalTrendTransactions = spendingTrends.reduce(
    (sum, month) => sum + month.transactionCount,
    0
  );

  // Prepare daily spending chart data
  const dailyChartData = dailySpending.map((day) => ({
    date: formatDateString(day.date, 'MMM d'),
    fullDate: day.date,
    amount: fromCentavos(day.amount),
  }));

  // Prepare monthly trend chart data
  const monthlyChartData = spendingTrends.map((month) => ({
    month: month.monthLabel,
    'Total Spending': fromCentavos(month.totalSpending),
    'Daily Average': fromCentavos(month.averageDailySpend),
    Transactions: month.transactionCount,
  }));

  // Calculate 6-month average
  const sixMonthAverage =
    spendingTrends.length > 0
      ? spendingTrends.reduce((sum, m) => sum + m.totalSpending, 0) / spendingTrends.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Period Spending</p>
            <p className="text-2xl font-bold text-red-600">{formatPHP(totalSpending)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDateString(dateFrom, 'MMM d')} - {formatDateString(dateTo, 'MMM d')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Daily Average</p>
            <p className="text-2xl font-bold">{formatPHP(averageDailySpend)}</p>
            <p className="text-xs text-muted-foreground mt-1">This period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">6-Month Average</p>
            <p className="text-2xl font-bold">{formatPHP(sixMonthAverage)}</p>
            <p className="text-xs text-muted-foreground mt-1">Monthly spending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">6-Month Transactions</p>
            <p className="text-2xl font-bold">{totalTrendTransactions}</p>
            <p className="text-xs text-muted-foreground mt-1">Total count</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Spending Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Spending</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyChartData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyChartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.expense} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.expense} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      value >= 1000 ? `₱${(value / 1000).toFixed(0)}k` : `₱${value}`
                    }
                  />
                  <Tooltip
                    formatter={(value) => [formatPHP(Number(value || 0) * 100), 'Spending']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return formatDateString(payload[0].payload.fullDate, 'EEEE, MMM d, yyyy');
                      }
                      return String(label);
                    }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={COLORS.expense}
                    fill="url(#spendingGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <p>No spending data for this period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Spending Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending Trend (6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyChartData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyChartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatPHP(Number(value || 0) * 100),
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="Total Spending"
                    fill={COLORS.expense}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <p>No trend data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {spendingTrends.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      Month
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                      Total Spending
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                      Daily Average
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                      Transactions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {spendingTrends.map((month) => (
                    <tr key={month.month} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{month.monthLabel}</td>
                      <td className="py-3 px-2 text-right text-red-600">
                        {formatPHP(month.totalSpending)}
                      </td>
                      <td className="py-3 px-2 text-right text-muted-foreground">
                        {formatPHP(month.averageDailySpend)}
                      </td>
                      <td className="py-3 px-2 text-right">{month.transactionCount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td className="py-3 px-2">Average</td>
                    <td className="py-3 px-2 text-right">{formatPHP(sixMonthAverage)}</td>
                    <td className="py-3 px-2 text-right">
                      {formatPHP(
                        spendingTrends.length > 0
                          ? spendingTrends.reduce((sum, m) => sum + m.averageDailySpend, 0) /
                              spendingTrends.length
                          : 0
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {Math.round(totalTrendTransactions / (spendingTrends.length || 1))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-4xl mb-2">📈</p>
              <p>No trend data available</p>
              <p className="text-sm mt-1">Start tracking your expenses to see spending trends</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
