import { CategoriesPageSkeleton } from '@/components/skeletons';

export default function CategoriesLoading() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <CategoriesPageSkeleton />
      </div>
    </div>
  );
}
