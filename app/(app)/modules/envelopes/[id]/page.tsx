import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getEnvelopeById, getEnvelopeTransactions } from '@/server/queries/envelopes';
import { getActiveEnvelopes } from '@/server/queries/allocations';
import { EnvelopeDetailClient } from '@/components/envelopes/envelope-detail-client';
import { EnvelopeTransactionsList } from '@/components/envelopes/envelope-transactions-list';
import { DailySpendingChart } from '@/components/envelopes/daily-spending-chart';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EnvelopeDetailPage({ params }: PageProps) {
  // Get authenticated user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Await params (Next.js 15 async params)
  const { id } = await params;

  // Fetch envelope details
  const envelope = await getEnvelopeById(id, user.id);

  if (!envelope) {
    notFound();
  }

  // Fetch transactions for this envelope
  const transactions = await getEnvelopeTransactions(id, user.id);

  // Fetch all envelopes for transfer modal
  const allEnvelopes = await getActiveEnvelopes(user.id);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <EnvelopeDetailClient envelope={envelope} allEnvelopes={allEnvelopes} />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Daily spending chart - takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <DailySpendingChart
            transactions={transactions}
            period={envelope.period}
            periodStart={envelope.periodStart}
          />
        </div>

        {/* Summary stats - takes 1 column on large screens */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Transaction Count
            </h3>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </div>
        </div>
      </div>

      {/* Transactions list */}
      <div className="mt-8">
        <EnvelopeTransactionsList transactions={transactions} />
      </div>
    </div>
  );
}
