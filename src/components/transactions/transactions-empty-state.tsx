'use client';

import { Button } from '@/components/ui/button';
import { useQuickAddStore } from '@/stores/quick-add-store';

export const TransactionsEmptyState = () => {
  const open = useQuickAddStore((state) => state.open);

  return (
    <div className="bg-card rounded-lg border p-12">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        {/* Illustration - emoji placeholder */}
        <div className="text-8xl mb-6">📝</div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-foreground mb-3">
          No transactions yet
        </h2>

        {/* Subtext */}
        <p className="text-muted-foreground mb-8">
          Get started by logging your first expense, income, or transfer
        </p>

        {/* CTA Button */}
        <Button onClick={open} size="lg">
          Log your first expense!
        </Button>
      </div>
    </div>
  );
};
