"use client";

import { Envelope } from '@/server/queries/allocations';
import { formatPHP } from '@/lib/format';

type EnvelopeCardProps = {
  envelope: Envelope;
};

export const EnvelopeCard = ({ envelope }: EnvelopeCardProps) => {
  const targetAmount = envelope.targetAmount || 0;
  const currentAmount = envelope.currentAmount || 0;
  const remaining = Math.max(0, targetAmount - currentAmount);
  const percentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

  // Determine progress bar color based on percentage
  const getProgressColor = (percent: number): string => {
    if (percent < 60) return 'bg-green-500';
    if (percent < 80) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Format period label
  const getPeriodLabel = (period: string | null): string => {
    if (!period || period === 'none') return '';
    if (period === 'weekly') return 'Weekly';
    if (period === 'monthly') return 'Monthly';
    if (period === 'yearly') return 'Yearly';
    return period;
  };

  const progressColor = getProgressColor(percentage);
  const periodLabel = getPeriodLabel(envelope.period);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
      {/* Header: Icon and Name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">{envelope.icon || '📋'}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{envelope.name}</h3>
          {periodLabel && (
            <p className="text-sm text-gray-500">{periodLabel}</p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {formatPHP(currentAmount)} / {formatPHP(targetAmount)}
          </span>
          <span className="text-sm font-medium text-gray-900">
            {percentage.toFixed(0)}%
          </span>
        </div>
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-300`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>

      {/* Remaining Amount */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Remaining</span>
        <span className="text-lg font-bold text-gray-900">
          {formatPHP(remaining)}
        </span>
      </div>
    </div>
  );
};
