'use client';

import { useState } from 'react';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import type { PeriodFilter } from '@/server/queries/statistics';

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'last-6-months', label: 'Last 6 Months' },
  { value: 'this-year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

type PeriodSelectorProps = {
  selectedPeriod: PeriodFilter;
  onPeriodChange: (period: PeriodFilter, customFrom?: string, customTo?: string) => void;
  customFrom?: string;
  customTo?: string;
};

export function PeriodSelector({
  selectedPeriod,
  onPeriodChange,
  customFrom,
  customTo,
}: PeriodSelectorProps) {
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: customFrom ? parseISO(customFrom) : undefined,
    to: customTo ? parseISO(customTo) : undefined,
  });

  const selectedLabel =
    selectedPeriod === 'custom' && customFrom && customTo
      ? `${format(parseISO(customFrom), 'MMM d')} - ${format(parseISO(customTo), 'MMM d, yyyy')}`
      : PERIOD_OPTIONS.find((p) => p.value === selectedPeriod)?.label || 'Select Period';

  const handlePeriodSelect = (period: PeriodFilter) => {
    if (period === 'custom') {
      setShowCustomDialog(true);
    } else {
      onPeriodChange(period);
    }
  };

  const handleCustomApply = () => {
    if (dateRange.from && dateRange.to) {
      onPeriodChange(
        'custom',
        format(dateRange.from, 'yyyy-MM-dd'),
        format(dateRange.to, 'yyyy-MM-dd')
      );
      setShowCustomDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{selectedLabel}</span>
            <span className="sm:hidden">
              {selectedPeriod === 'custom' ? 'Custom' : selectedLabel}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {PERIOD_OPTIONS.slice(0, 5).map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handlePeriodSelect(option.value)}
              className={selectedPeriod === option.value ? 'bg-accent' : ''}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handlePeriodSelect('custom')}
            className={selectedPeriod === 'custom' ? 'bg-accent' : ''}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Custom Range...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent className="max-w-fit">
          <DialogHeader>
            <DialogTitle>Select Date Range</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
              numberOfMonths={2}
              disabled={(date) => date > new Date()}
              className="rounded-md border"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCustomApply}
              disabled={!dateRange.from || !dateRange.to}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
