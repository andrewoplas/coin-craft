'use client';

import { useEffect, useState } from 'react';
import { type WidgetProps } from '@/modules/types';
import { Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';

type HealthScoreData = {
  totalScore: number;
  level: 'poor' | 'fair' | 'good' | 'excellent';
  message: string;
  baseScore: number;
  moduleScore: number;
};

export function HealthScoreWidget({ size }: WidgetProps) {
  const [data, setData] = useState<HealthScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/dashboard/health-score');
        if (response.ok) {
          const healthData = await response.json();
          setData(healthData);
        }
      } catch (error) {
        console.error('Failed to load health score:', error);
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

  const score = data?.totalScore ?? 0;
  const level = data?.level ?? 'fair';
  const message = data?.message ?? '';

  // Color based on score
  const getScoreColor = (score: number) => {
    if (score >= 70) return { main: '#10B981', bg: 'bg-green-50', text: 'text-green-600' };
    if (score >= 40) return { main: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-600' };
    return { main: '#EF4444', bg: 'bg-red-50', text: 'text-red-600' };
  };

  const colors = getScoreColor(score);

  // Calculate circumference for circular progress
  const radius = size === 'S' ? 32 : 45;
  const strokeWidth = size === 'S' ? 6 : 8;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  // Level labels
  const levelLabels: Record<string, string> = {
    poor: 'Needs Work',
    fair: 'Fair',
    good: 'Good',
    excellent: 'Excellent',
  };

  // Small size - compact circular display
  if (size === 'S') {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="relative">
          <svg className="transform -rotate-90" width={80} height={80}>
            {/* Background circle */}
            <circle
              cx={40}
              cy={40}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              cx={40}
              cy={40}
              r={radius}
              fill="none"
              stroke={colors.main}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${colors.text}`}>{score}</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground mt-1">Health Score</span>
      </div>
    );
  }

  // Medium and Large size - full display
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        <Heart className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">Financial Health</span>
      </div>

      <div className="flex items-center gap-6">
        {/* Circular progress */}
        <div className="relative flex-shrink-0">
          <svg className="transform -rotate-90" width={100} height={100}>
            <circle
              cx={50}
              cy={50}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={50}
              cy={50}
              r={radius}
              fill="none"
              stroke={colors.main}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            {levelLabels[level]}
          </div>
          <p className="text-sm text-muted-foreground mt-2">{message}</p>

          {size === 'L' && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Base Score</span>
                <span className="font-medium">{data?.baseScore || 0}/40</span>
              </div>
              {(data?.moduleScore ?? 0) > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Module Bonus</span>
                  <span className="font-medium">+{data?.moduleScore || 0}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
