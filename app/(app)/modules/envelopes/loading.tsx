import { EnvelopesPageSkeleton } from '@/components/skeletons';

export default function EnvelopesLoading() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <EnvelopesPageSkeleton />
      </div>
    </div>
  );
}
