import { GoalsPageSkeleton } from '@/components/skeletons';

export default function GoalsLoading() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <GoalsPageSkeleton />
      </div>
    </div>
  );
}
