"use client";

import { Envelope } from '@/server/queries/allocations';
import { formatPHP } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { PauseEnvelopeDialog } from './pause-envelope-dialog';

type EnvelopeCardProps = {
  envelope: Envelope;
  onClick?: () => void;
  onEdit?: () => void;
  onPause?: () => void;
};

export const EnvelopeCard = ({ envelope, onClick, onEdit, onPause }: EnvelopeCardProps) => {
  const targetAmount = envelope.targetAmount || 0;
  const currentAmount = envelope.currentAmount || 0;
  const remaining = Math.max(0, targetAmount - currentAmount);
  const percentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    onEdit?.();
  };

  const handlePause = () => {
    onPause?.();
  };

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
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header: Icon and Name */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{envelope.icon || '📋'}</div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{envelope.name}</h3>
            {periodLabel && <p className="text-sm text-gray-500">{periodLabel}</p>}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Edit button */}
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={handleEdit} className="h-8 w-8 p-0">
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit envelope</span>
            </Button>
          )}

          {/* Pause button */}
          {onPause && (
            <PauseEnvelopeDialog
              envelopeId={envelope.id}
              envelopeName={envelope.name}
              currentAmount={currentAmount}
              targetAmount={targetAmount}
            />
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
