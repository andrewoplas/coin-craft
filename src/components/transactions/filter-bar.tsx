'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { TransactionType } from '@/lib/types';

type Category = {
  id: string;
  name: string;
  icon: string | null;
};

type Account = {
  id: string;
  name: string;
  icon: string | null;
};

type FilterBarProps = {
  categories: Category[];
  accounts: Account[];
};

export const FilterBar = ({ categories, accounts }: FilterBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read current filters from URL
  const currentType = searchParams.get('type') || 'all';
  const currentAccount = searchParams.get('account') || 'all';
  const currentCategory = searchParams.get('category') || 'all';
  const currentDateFrom = searchParams.get('dateFrom') || '';
  const currentDateTo = searchParams.get('dateTo') || '';

  // Update URL with new filter value
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === 'all' || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    router.push(pathname);
  };

  // Check if any filters are active
  const hasActiveFilters =
    currentType !== 'all' ||
    currentAccount !== 'all' ||
    currentCategory !== 'all' ||
    currentDateFrom !== '' ||
    currentDateTo !== '';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Type Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
              Type
            </label>
            <Select value={currentType} onValueChange={(value) => updateFilter('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All transactions</SelectItem>
                <SelectItem value="expense">
                  <span className="text-red-600">Expense</span>
                </SelectItem>
                <SelectItem value="income">
                  <span className="text-green-600">Income</span>
                </SelectItem>
                <SelectItem value="transfer">
                  <span className="text-indigo-600">Transfer</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Account Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
              Account
            </label>
            <Select
              value={currentAccount}
              onValueChange={(value) => updateFilter('account', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All accounts</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.icon && <span className="mr-1">{account.icon}</span>}
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
              Category
            </label>
            <Select
              value={currentCategory}
              onValueChange={(value) => updateFilter('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon && <span className="mr-1">{category.icon}</span>}
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range: From */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
              From Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !currentDateFrom && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {currentDateFrom ? format(new Date(currentDateFrom), 'PP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={currentDateFrom ? new Date(currentDateFrom) : undefined}
                  onSelect={(date) => {
                    updateFilter('dateFrom', date ? format(date, 'yyyy-MM-dd') : '');
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date Range: To */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">
              To Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !currentDateTo && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {currentDateTo ? format(new Date(currentDateTo), 'PP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={currentDateTo ? new Date(currentDateTo) : undefined}
                  onSelect={(date) => {
                    updateFilter('dateTo', date ? format(date, 'yyyy-MM-dd') : '');
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="mr-1 h-4 w-4" />
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
