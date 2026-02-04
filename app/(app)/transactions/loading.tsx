import { TransactionListSkeleton } from '@/components/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function TransactionsLoading() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Skeleton className="h-9 w-40 mb-8" />
        <TransactionListSkeleton />
      </div>
    </div>
  );
}
