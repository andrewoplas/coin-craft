'use client';

import {
  BarChart,
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPHP, fromCentavos } from '@/lib/format';
import { COLORS } from '@/lib/constants';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import type { MonthlyCashFlow, PeriodComparison } from '@/server/queries/statistics';

type CashFlowTabProps = {
  monthlyCashFlow: MonthlyCashFlow[];
  periodComparison: PeriodComparison;
  hasGoals: boolean;
};

export function CashFlowTab({ monthlyCashFlow, periodComparison, hasGoals }: CashFlowTabProps) {
  // Prepare chart data
  const chartData = monthlyCashFlow.map((month) => ({
    month: month.monthLabel,
    Income: fromCentavos(month.income),
    Expenses: fromCentavos(month.expenses),
    'Net Cash Flow': fromCentavos(month.netCashFlow),
  }));

  const { currentPeriod, previousPeriod, changes } = periodComparison;

  // Helper to render change indicator
  const renderChange = (change: number, inverse: boolean = false) => {
    const isPositive = inverse ? change < 0 : change > 0;
    const isNegative = inverse ? change > 0 : change < 0;

    if (Math.abs(change) < 0.1) {
      return (
        <span className="text-muted-foreground flex items-center gap-1">
          <MinusIcon className="h-4 w-4" />
          No change
        </span>
      );
    }

    return (
      <span
        className={`flex items-center gap-1 ${
          isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-muted-foreground'
        }`}
      >
        {isPositive ? (
          <ArrowUpIcon className="h-4 w-4" />
        ) : (
          <ArrowDownIcon className="h-4 w-4" />
        )}
        {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Income</p>
            <p className="text-2xl font-bold text-green-600">
              {formatPHP(currentPeriod.income)}
            </p>
            <div className="text-xs mt-1">{renderChange(changes.income)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              {formatPHP(currentPeriod.expenses)}
            </p>
            <div className="text-xs mt-1">{renderChange(changes.expenses, true)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Net Cash Flow</p>
            <p
              className={`text-2xl font-bold ${
                currentPeriod.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatPHP(currentPeriod.netCashFlow)}
            </p>
            <div className="text-xs mt-1">{renderChange(changes.netCashFlow)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Transactions</p>
            <p className="text-2xl font-bold">{currentPeriod.transactionCount}</p>
            <div className="text-xs mt-1">{renderChange(changes.transactionCount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Income vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
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
                    tickFormatter={(value) =>
                      `₱${(value / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip
                    formatter={(value) => formatPHP(Number(value || 0) * 100)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar
                    dataKey="Income"
                    fill={COLORS.income}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                  <Bar
                    dataKey="Expenses"
                    fill={COLORS.expense}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                  <Line
                    type="monotone"
                    dataKey="Net Cash Flow"
                    stroke={COLORS.transfer}
                    strokeWidth={2}
                    dot={{ fill: COLORS.transfer, strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              <p>No cash flow data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Period Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Period-over-Period Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Metric
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                    Current Period
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                    Previous Period
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-2 font-medium">Income</td>
                  <td className="py-3 px-2 text-right text-green-600">
                    {formatPHP(currentPeriod.income)}
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    {formatPHP(previousPeriod.income)}
                  </td>
                  <td className="py-3 px-2 text-right">{renderChange(changes.income)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2 font-medium">Expenses</td>
                  <td className="py-3 px-2 text-right text-red-600">
                    {formatPHP(currentPeriod.expenses)}
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    {formatPHP(previousPeriod.expenses)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {renderChange(changes.expenses, true)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2 font-medium">Net Cash Flow</td>
                  <td
                    className={`py-3 px-2 text-right ${
                      currentPeriod.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatPHP(currentPeriod.netCashFlow)}
                  </td>
                  <td
                    className={`py-3 px-2 text-right text-muted-foreground`}
                  >
                    {formatPHP(previousPeriod.netCashFlow)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {renderChange(changes.netCashFlow)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-medium">Transactions</td>
                  <td className="py-3 px-2 text-right">{currentPeriod.transactionCount}</td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    {previousPeriod.transactionCount}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {renderChange(changes.transactionCount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Savings Trends (if goals active) */}
      {hasGoals && (
        <Card>
          <CardHeader>
            <CardTitle>🎯 Savings Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Goal-based savings trends coming soon
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
