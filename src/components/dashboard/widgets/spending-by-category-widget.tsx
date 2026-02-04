'use client';

import { useEffect, useState } from 'react';
import { type WidgetProps } from '@/modules/types';
import { formatPHP } from '@/lib/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

type CategoryData = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  amount: number;
  percentage: number;
};

const DEFAULT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#6366F1', '#F472B6', '#6B7280',
];

export function SpendingByCategoryWidget({ size }: WidgetProps) {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/dashboard/spending-by-category');
        if (response.ok) {
          const categoryData = await response.json();
          setData(categoryData);
        }
      } catch (error) {
        console.error('Failed to load spending by category:', error);
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

  if (data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <PieChartIcon className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No spending this month</p>
        <p className="text-xs text-muted-foreground mt-1">
          Your spending breakdown will appear here
        </p>
      </div>
    );
  }

  const chartData = data.slice(0, 6).map((d, index) => ({
    name: d.categoryName,
    value: d.amount,
    color: d.categoryColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    icon: d.categoryIcon,
    percentage: d.percentage,
  }));

  const formatTooltipValue = (value: number | string | (number | string)[] | undefined) => {
    const numValue = typeof value === 'number' ? value : 0;
    return formatPHP(numValue);
  };

  // For small size, show compact list instead of chart
  if (size === 'S') {
    return (
      <div className="h-full flex flex-col space-y-2">
        {data.slice(0, 4).map((cat) => (
          <div key={cat.categoryId} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{cat.categoryIcon || '📦'}</span>
              <span className="text-xs truncate max-w-[80px]">{cat.categoryName}</span>
            </div>
            <span className="text-xs font-medium">{cat.percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className={`flex ${size === 'L' ? 'flex-row' : 'flex-col'} h-full`}>
        <div className={`${size === 'L' ? 'w-1/2' : 'flex-1'} min-h-[150px]`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={size === 'M' ? 30 : 40}
                outerRadius={size === 'M' ? 55 : 70}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={formatTooltipValue}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {size === 'L' && (
          <div className="w-1/2 flex flex-col justify-center space-y-2 pl-4">
            {chartData.map((cat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm">{cat.icon || '📦'}</span>
                  <span className="text-sm truncate max-w-[100px]">{cat.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{formatPHP(cat.value)}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {cat.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
