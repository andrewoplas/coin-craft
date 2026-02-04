'use client';

import { useState, useEffect, useRef } from 'react';
import { TransactionList } from './transaction-list';
import { getNextTransactionsPage } from '@/server/actions/transactions';
import type { TransactionWithRelations } from '@/server/queries/transactions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type InfiniteTransactionListProps = {
  initialTransactions: TransactionWithRelations[];
  initialHasMore: boolean;
  initialNextCursor?: string;
  filters?: {
    type?: string;
    accountId?: string;
    categoryId?: string;
    dateFrom?: string;
    dateTo?: string;
    note?: string;
  };
};

export function InfiniteTransactionList({
  initialTransactions,
  initialHasMore,
  initialNextCursor,
  filters,
}: InfiniteTransactionListProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset state when filters change (new server-side fetch)
  useEffect(() => {
    setTransactions(initialTransactions);
    setHasMore(initialHasMore);
    setNextCursor(initialNextCursor);
  }, [initialTransactions, initialHasMore, initialNextCursor]);

  // Load more transactions
  const loadMore = async () => {
    if (!hasMore || !nextCursor || isLoading) return;

    setIsLoading(true);

    try {
      const result = await getNextTransactionsPage(nextCursor, filters);

      if (result.success && result.transactions) {
        setTransactions((prev) => [...prev, ...result.transactions!]);
        setHasMore(result.hasMore || false);
        setNextCursor(result.nextCursor);
      } else {
        toast.error('Failed to load more transactions', {
          description: result.error || 'Please try again',
        });
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more transactions:', error);
      toast.error('Failed to load more transactions', {
        description: 'An unexpected error occurred',
      });
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up Intersection Observer to detect when sentinel is visible
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Start loading before user reaches bottom
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, nextCursor]);

  return (
    <div>
      <TransactionList transactions={transactions} />

      {hasMore && (
        <div
          ref={sentinelRef}
          className="mt-8 flex justify-center items-center py-4"
        >
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading more transactions...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
