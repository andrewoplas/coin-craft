import { Skeleton } from '@/components/ui/skeleton';

// Transaction List Skeleton
export function TransactionListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filter bar skeleton */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 flex-1 min-w-[200px]" />
      </div>

      {/* Date group */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        {[...Array(5)].map((_, i) => (
          <TransactionRowSkeleton key={i} />
        ))}
      </div>

      {/* Another date group */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        {[...Array(3)].map((_, i) => (
          <TransactionRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Single transaction row skeleton
export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  );
}

// Dashboard Widget Skeleton
export function WidgetSkeleton({ size = 'M' }: { size?: 'S' | 'M' | 'L' }) {
  const heights = { S: 'h-32', M: 'h-48', L: 'h-64' };
  return (
    <div className={`bg-card rounded-lg border p-4 ${heights[size]}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-8 w-32" />
        {size !== 'S' && <Skeleton className="h-20 w-full" />}
      </div>
    </div>
  );
}

// Dashboard Grid Skeleton
export function DashboardGridSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-9 w-40" />
      </div>

      {/* Widget grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <WidgetSkeleton size="S" />
        <WidgetSkeleton size="S" />
        <WidgetSkeleton size="M" />
        <WidgetSkeleton size="M" />
        <WidgetSkeleton size="M" />
        <WidgetSkeleton size="M" />
      </div>
    </div>
  );
}

// Accounts Page Skeleton
export function AccountsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg p-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-3 w-32 mx-auto" />
        </div>
      </div>

      {/* Account cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(4)].map((_, i) => (
          <AccountCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Account Card Skeleton
export function AccountCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-6 w-24" />
    </div>
  );
}

// Categories Page Skeleton
export function CategoriesPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Expense Categories */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <CategoryRowSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Income Categories */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-36" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <CategoryRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Category Row Skeleton
export function CategoryRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
      <Skeleton className="h-8 w-8 rounded" />
      <Skeleton className="h-4 w-24 flex-1" />
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-6 w-6" />
    </div>
  );
}

// Statistics Page Skeleton
export function StatisticsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Main chart */}
      <div className="bg-card rounded-lg border p-4">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </div>
  );
}

// Stat Card Skeleton
export function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-4 space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// Envelopes Page Skeleton
export function EnvelopesPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Envelope cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(4)].map((_, i) => (
          <EnvelopeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Envelope Card Skeleton
export function EnvelopeCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

// Goals Page Skeleton
export function GoalsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Goal cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <GoalCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Goal Card Skeleton
export function GoalCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-36" />
    </div>
  );
}

// Settings Page Skeleton
export function SettingsPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <Skeleton className="h-9 w-32" />

      {/* Settings sections */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-6 w-36" />
          <div className="bg-card rounded-lg border p-4 space-y-4">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-48" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Envelope/Goal Detail Page Skeleton
export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Progress section */}
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-4 w-full rounded-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card rounded-lg border p-4">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>

      {/* Transaction/Contribution list */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <Skeleton className="h-5 w-32" />
        {[...Array(5)].map((_, i) => (
          <TransactionRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Achievement Gallery Skeleton
export function AchievementGallerySkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-4 text-center space-y-2">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
            <Skeleton className="h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Monthly Recap Skeleton
export function MonthlyRecapSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-9 w-48" />
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-40 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton className="h-3 w-20 mx-auto" />
              <Skeleton className="h-6 w-24 mx-auto" />
            </div>
          ))}
        </div>

        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

// Character/Module Settings Skeleton
export function ModuleSettingsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
