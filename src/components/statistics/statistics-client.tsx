'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PeriodSelector } from './period-selector';
import { SpendingTab } from './spending-tab';
import { CashFlowTab } from './cash-flow-tab';
import { TrendsTab } from './trends-tab';
import type {
  CategorySpending,
  MonthlyCashFlow,
  DailySpending,
  TrendData,
  TopCategory,
  PeriodComparison,
  PeriodFilter,
} from '@/server/queries/statistics';

type StatisticsClientProps = {
  initialData: {
    spendingByCategory: CategorySpending[];
    monthlyCashFlow: MonthlyCashFlow[];
    dailySpending: DailySpending[];
    spendingTrends: TrendData[];
    topCategories: TopCategory[];
    periodComparison: PeriodComparison;
    averageDailySpend: number;
  };
  period: PeriodFilter;
  dateFrom: string;
  dateTo: string;
  activeTab: string;
  hasEnvelopes: boolean;
  hasGoals: boolean;
};

export function StatisticsClient({
  initialData,
  period,
  dateFrom,
  dateTo,
  activeTab,
  hasEnvelopes,
  hasGoals,
}: StatisticsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>(period);

  // Handle period change - update URL and refresh data
  const handlePeriodChange = (newPeriod: PeriodFilter, customFrom?: string, customTo?: string) => {
    setSelectedPeriod(newPeriod);
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', newPeriod);

    if (newPeriod === 'custom' && customFrom && customTo) {
      params.set('dateFrom', customFrom);
      params.set('dateTo', customTo);
    } else {
      params.delete('dateFrom');
      params.delete('dateTo');
    }

    router.push(`/statistics?${params.toString()}`);
  };

  // Handle tab change - update URL
  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/statistics?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Statistics</h1>
          <p className="text-muted-foreground mt-1">
            Charts, reports, and spending insights
          </p>
        </div>
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          customFrom={dateFrom}
          customTo={dateTo}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="spending" className="gap-2">
            <span className="hidden sm:inline">💸</span>
            Spending
          </TabsTrigger>
          <TabsTrigger value="cash-flow" className="gap-2">
            <span className="hidden sm:inline">💰</span>
            Cash Flow
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <span className="hidden sm:inline">📈</span>
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spending" className="space-y-6">
          <SpendingTab
            spendingByCategory={initialData.spendingByCategory}
            topCategories={initialData.topCategories}
            hasEnvelopes={hasEnvelopes}
          />
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-6">
          <CashFlowTab
            monthlyCashFlow={initialData.monthlyCashFlow}
            periodComparison={initialData.periodComparison}
            hasGoals={hasGoals}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <TrendsTab
            dailySpending={initialData.dailySpending}
            spendingTrends={initialData.spendingTrends}
            averageDailySpend={initialData.averageDailySpend}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
