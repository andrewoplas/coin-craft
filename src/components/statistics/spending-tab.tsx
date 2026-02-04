'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPHP, fromCentavos } from '@/lib/format';
import type { CategorySpending, TopCategory } from '@/server/queries/statistics';

// Default colors for pie chart
const CHART_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#F97316', // orange
  '#6B7280', // gray
];

type SpendingTabProps = {
  spendingByCategory: CategorySpending[];
  topCategories: TopCategory[];
  hasEnvelopes: boolean;
};

export function SpendingTab({
  spendingByCategory,
  topCategories,
  hasEnvelopes,
}: SpendingTabProps) {
  const totalSpending = spendingByCategory.reduce((sum, cat) => sum + cat.amount, 0);

  // Prepare pie chart data - only main categories (no parentId)
  const mainCategories = spendingByCategory.filter((cat) => !cat.parentId);
  const pieData = mainCategories.map((cat, index) => ({
    name: cat.categoryName,
    value: fromCentavos(cat.amount),
    color: cat.categoryColor || CHART_COLORS[index % CHART_COLORS.length],
    icon: cat.categoryIcon,
    percentage: cat.percentage,
  }));

  // Group by parent for subcategory breakdown
  const categoryGroups = new Map<string, CategorySpending[]>();
  spendingByCategory.forEach((cat) => {
    if (cat.parentId) {
      const existing = categoryGroups.get(cat.parentId) || [];
      categoryGroups.set(cat.parentId, [...existing, cat]);
    }
  });

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Spending</p>
            <p className="text-2xl font-bold text-red-600">{formatPHP(totalSpending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Categories Used</p>
            <p className="text-2xl font-bold">{spendingByCategory.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Top Category</p>
            <p className="text-2xl font-bold">
              {topCategories[0]
                ? `${topCategories[0].categoryIcon || ''} ${topCategories[0].categoryName}`
                : 'None'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatPHP(Number(value || 0) * 100), 'Amount']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend
                      formatter={(value, entry) => {
                        const item = pieData.find((d) => d.name === value);
                        return (
                          <span className="text-sm">
                            {item?.icon} {value}
                          </span>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No spending data for this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length > 0 ? (
              <div className="space-y-4">
                {topCategories.map((category, index) => (
                  <div key={category.categoryId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.categoryIcon || '📦'}</span>
                        <span className="font-medium">{category.categoryName}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPHP(category.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${category.percentage}%`,
                          backgroundColor:
                            category.categoryColor ||
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                <p>No spending data for this period</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Category Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {spendingByCategory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      Category
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                      Transactions
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {spendingByCategory.map((category) => (
                    <tr
                      key={category.categoryId}
                      className={`border-b hover:bg-muted/50 ${
                        category.parentId ? 'bg-muted/20' : ''
                      }`}
                    >
                      <td className="py-3 px-2">
                        <div
                          className={`flex items-center gap-2 ${
                            category.parentId ? 'pl-6' : ''
                          }`}
                        >
                          <span>{category.categoryIcon || '📦'}</span>
                          <span className={category.parentId ? 'text-sm' : 'font-medium'}>
                            {category.categoryName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right text-muted-foreground">
                        {category.transactionCount}
                      </td>
                      <td className="py-3 px-2 text-right font-medium">
                        {formatPHP(category.amount)}
                      </td>
                      <td className="py-3 px-2 text-right text-muted-foreground">
                        {category.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td className="py-3 px-2">Total</td>
                    <td className="py-3 px-2 text-right">
                      {spendingByCategory.reduce((sum, c) => sum + c.transactionCount, 0)}
                    </td>
                    <td className="py-3 px-2 text-right">{formatPHP(totalSpending)}</td>
                    <td className="py-3 px-2 text-right">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-4xl mb-2">📊</p>
              <p>No spending data for this period</p>
              <p className="text-sm mt-1">
                Start tracking your expenses to see category breakdowns
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Envelope Performance (if active) */}
      {hasEnvelopes && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Envelope Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Envelope budget tracking stats coming soon
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
