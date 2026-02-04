'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPHP } from '@/lib/format';
import { format, parse } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Trophy,
  Target,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type MonthlyRecapData = {
  month: string;
  monthName: string;
  daysInMonth: number;
  daysLogged: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  topCategory: {
    name: string;
    icon: string;
    amount: number;
    percentage: number;
  } | null;
  biggestExpense: {
    amount: number;
    category: string;
    categoryIcon: string;
    note: string | null;
    date: string;
  } | null;
  loggingStreak: number;
  transactionCount: number;
  achievementsEarned: {
    id: string;
    name: string;
    icon: string;
    earnedAt: Date;
  }[];
  envelopeHighlights?: {
    totalEnvelopes: number;
    underBudgetCount: number;
    totalBudget: number;
    totalSpent: number;
  };
  goalHighlights?: {
    totalGoals: number;
    totalSaved: number;
    goalsCompleted: number;
  };
};

type MonthlyRecapClientProps = {
  data: MonthlyRecapData;
  availableMonths: string[];
};

export function MonthlyRecapClient({ data, availableMonths }: MonthlyRecapClientProps) {
  const router = useRouter();
  const currentIndex = availableMonths.indexOf(data.month);
  const hasPrev = currentIndex < availableMonths.length - 1;
  const hasNext = currentIndex > 0;

  const navigateTo = (month: string) => {
    router.push(`/recap/${month}`);
  };

  const formatMonth = (month: string) => {
    const date = parse(month + '-01', 'yyyy-MM-dd', new Date());
    return format(date, 'MMMM yyyy');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              disabled={!hasPrev}
              onClick={() => hasPrev && navigateTo(availableMonths[currentIndex + 1])}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Select
              value={data.month}
              onValueChange={navigateTo}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {formatMonth(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              disabled={!hasNext}
              onClick={() => hasNext && navigateTo(availableMonths[currentIndex - 1])}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
            Your Monthly Recap
          </p>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {data.monthName}
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="space-y-6">
          {/* Income & Expenses */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Money Flow
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {formatPHP(data.totalIncome)}
                </p>
                <p className="text-sm text-muted-foreground">Income</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <TrendingDown className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">
                  {formatPHP(data.totalExpenses)}
                </p>
                <p className="text-sm text-muted-foreground">Expenses</p>
              </div>
            </div>

            <div className={`text-center p-4 rounded-xl ${
              data.netSavings >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <p className={`text-3xl font-bold ${
                data.netSavings >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {data.netSavings >= 0 ? '+' : ''}{formatPHP(data.netSavings)}
              </p>
              <p className="text-sm text-muted-foreground">
                Net {data.netSavings >= 0 ? 'Savings' : 'Loss'}
                {data.savingsRate !== 0 && ` (${Math.abs(data.savingsRate).toFixed(1)}%)`}
              </p>
            </div>
          </div>

          {/* Top Category */}
          {data.topCategory && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Top Spending Category
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{data.topCategory.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{data.topCategory.name}</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatPHP(data.topCategory.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {data.topCategory.percentage.toFixed(1)}% of total spending
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Biggest Expense */}
          {data.biggestExpense && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Biggest Single Expense
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{data.biggestExpense.categoryIcon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{data.biggestExpense.category}</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatPHP(data.biggestExpense.amount)}
                  </p>
                  {data.biggestExpense.note && (
                    <p className="text-sm text-muted-foreground truncate">
                      {data.biggestExpense.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Activity Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Your Activity
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <Receipt className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-amber-700">
                  {data.transactionCount}
                </p>
                <p className="text-sm text-muted-foreground">Transactions</p>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-xl">
                <Calendar className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-indigo-700">
                  {data.daysLogged}/{data.daysInMonth}
                </p>
                <p className="text-sm text-muted-foreground">Days Logged</p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          {data.achievementsEarned.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Achievements Earned
              </h2>
              <div className="flex flex-wrap gap-3">
                {data.achievementsEarned.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-full"
                  >
                    <span className="text-xl">{achievement.icon}</span>
                    <span className="font-medium text-amber-800">{achievement.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module Highlights */}
          {data.envelopeHighlights && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-purple-500" />
                Envelope Performance
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {data.envelopeHighlights.underBudgetCount}/{data.envelopeHighlights.totalEnvelopes}
                  </p>
                  <p className="text-sm text-muted-foreground">Under Budget</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPHP(data.envelopeHighlights.totalSpent)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    of {formatPHP(data.envelopeHighlights.totalBudget)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {data.goalHighlights && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                Goals Progress
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {data.goalHighlights.totalGoals}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Goals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formatPHP(data.goalHighlights.totalSaved)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                </div>
              </div>
              {data.goalHighlights.goalsCompleted > 0 && (
                <div className="mt-4 text-center p-2 bg-green-100 rounded-lg">
                  <p className="text-green-700 font-medium">
                    {data.goalHighlights.goalsCompleted} goal{data.goalHighlights.goalsCompleted > 1 ? 's' : ''} completed!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Share Button (placeholder) */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Share your progress coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}
