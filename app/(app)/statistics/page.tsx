import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StatisticsClient } from '@/components/statistics/statistics-client';
import { getUserActiveModules } from '@/server/queries/user';
import {
  getSpendingByCategory,
  getMonthlyCashFlow,
  getDailySpending,
  getSpendingTrends,
  getTopCategories,
  getPeriodComparison,
  getDateRangeFromPeriod,
  getAverageDailySpending,
} from '@/server/queries/statistics';
import type { PeriodFilter } from '@/server/queries/statistics';

type SearchParams = Promise<{ period?: string; dateFrom?: string; dateTo?: string; tab?: string }>;

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Parse search params
  const params = await searchParams;
  const period = (params.period as PeriodFilter) || 'this-month';
  const customFrom = params.dateFrom;
  const customTo = params.dateTo;
  const activeTab = params.tab || 'spending';

  // Get date range for the selected period
  const { dateFrom, dateTo } = getDateRangeFromPeriod(period, customFrom, customTo);

  // Get active modules to show module-specific stats
  const activeModuleIds = await getUserActiveModules(user.id);
  const hasEnvelopes = activeModuleIds.includes('envelope');
  const hasGoals = activeModuleIds.includes('goals');

  // Fetch initial data for all tabs in parallel
  const [
    spendingByCategory,
    monthlyCashFlow,
    dailySpending,
    spendingTrends,
    topCategories,
    periodComparison,
    averageDailySpend,
  ] = await Promise.all([
    getSpendingByCategory(user.id, dateFrom, dateTo),
    getMonthlyCashFlow(user.id, 6),
    getDailySpending(user.id, dateFrom, dateTo),
    getSpendingTrends(user.id, 6),
    getTopCategories(user.id, dateFrom, dateTo, 5),
    getPeriodComparison(user.id, period, customFrom, customTo),
    getAverageDailySpending(user.id, dateFrom, dateTo),
  ]);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <StatisticsClient
          initialData={{
            spendingByCategory,
            monthlyCashFlow,
            dailySpending,
            spendingTrends,
            topCategories,
            periodComparison,
            averageDailySpend,
          }}
          period={period}
          dateFrom={dateFrom}
          dateTo={dateTo}
          activeTab={activeTab}
          hasEnvelopes={hasEnvelopes}
          hasGoals={hasGoals}
        />
      </div>
    </div>
  );
}
