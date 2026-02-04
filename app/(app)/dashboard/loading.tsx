import { DashboardGridSkeleton } from '@/components/skeletons';

export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardGridSkeleton />
      </div>
    </div>
  );
}
