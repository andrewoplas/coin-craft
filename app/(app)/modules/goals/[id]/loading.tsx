import { DetailPageSkeleton } from '@/components/skeletons';

export default function GoalDetailLoading() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <DetailPageSkeleton />
      </div>
    </div>
  );
}
