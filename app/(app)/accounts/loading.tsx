import { AccountsPageSkeleton } from '@/components/skeletons';

export default function AccountsLoading() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <AccountsPageSkeleton />
      </div>
    </div>
  );
}
