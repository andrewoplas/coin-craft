'use client';

import { Button } from '@/components/ui/button';
import { useQuickAddStore } from '@/stores/quick-add-store';

export const TransactionsEmptyState = () => {
  const open = useQuickAddStore((state) => state.open);

  return (
    <div className="bg-white rounded-lg shadow p-12">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        {/* Illustration - emoji placeholder */}
        <div className="text-8xl mb-6">📝</div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          No transactions yet
        </h2>

        {/* Subtext */}
        <p className="text-gray-600 mb-8">
          Get started by logging your first expense, income, or transfer
        </p>

        {/* CTA Button */}
        <Button
          onClick={open}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
        >
          Log your first expense!
        </Button>
      </div>
    </div>
  );
};
