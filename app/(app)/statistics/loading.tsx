import { StatisticsPageSkeleton } from '@/components/skeletons';

export default function StatisticsLoading() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <StatisticsPageSkeleton />
      </div>
    </div>
  );
}
