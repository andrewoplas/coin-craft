'use client';

import { useEffect, useState } from 'react';
import { formatPHP } from '@/lib/format';
import type { WidgetProps } from '@/modules/types';

type TopCategory = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  amount: number;
  percentage: number;
};

// Default colors
const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function TopCategoriesWidget({ size }: WidgetProps) {
  const [data, setData] = useState<TopCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/statistics/top-categories');
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
        <span className="text-2xl mb-1">🏆</span>
        <span className="text-sm">No spending data</span>
      </div>
    );
  }

  // Small size: top 3 compact
  const displayCount = size === 'S' ? 3 : 5;
  const categories = data.slice(0, displayCount);

  return (
    <div className="h-full flex flex-col justify-center space-y-2">
      {categories.map((category, index) => (
        <div key={category.categoryId} className="flex items-center gap-2">
          <span className="text-base">{category.categoryIcon || '📦'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span
                className={`truncate ${size === 'S' ? 'text-xs' : 'text-sm'}`}
              >
                {category.categoryName}
              </span>
              <span
                className={`font-medium ${
                  size === 'S' ? 'text-xs' : 'text-sm'
                }`}
              >
                {category.percentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${category.percentage}%`,
                  backgroundColor:
                    category.categoryColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
                }}
              />
            </div>
          </div>
        </div>
      ))}
      {size !== 'S' && data.length > displayCount && (
        <p className="text-xs text-muted-foreground text-center">
          +{data.length - displayCount} more categories
        </p>
      )}
    </div>
  );
}
