'use client';

import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { fromCentavos } from '@/lib/format';
import type { EnvelopeTransaction } from '@/server/queries/envelopes';

type EnvelopeTransactionsListProps = {
  transactions: EnvelopeTransaction[];
};

type GroupedTransactions = {
  date: string;
  dateLabel: string;
  transactions: EnvelopeTransaction[];
};

function groupTransactionsByDate(
  transactions: EnvelopeTransaction[]
): GroupedTransactions[] {
  const groups = new Map<string, EnvelopeTransaction[]>();

  for (const tx of transactions) {
    const dateKey = tx.date;
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(tx);
  }

  // Convert to array and add labels
  const result: GroupedTransactions[] = [];
  for (const [date, txs] of groups) {
    const parsedDate = parseISO(date);
    let dateLabel: string;

    if (isToday(parsedDate)) {
      dateLabel = 'Today';
    } else if (isYesterday(parsedDate)) {
      dateLabel = 'Yesterday';
    } else {
      dateLabel = format(parsedDate, 'MMMM d, yyyy');
    }

    result.push({
      date,
      dateLabel,
      transactions: txs,
    });
  }

  return result;
}

export function EnvelopeTransactionsList({
  transactions,
}: EnvelopeTransactionsListProps) {
  const grouped = groupTransactionsByDate(transactions);

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">
          No transactions yet for this envelope.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Create an expense with a linked category to see transactions here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Transactions</h2>

      {grouped.map((group) => (
        <div key={group.date} className="space-y-2">
          {/* Date header */}
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-1 py-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {group.dateLabel}
            </h3>
          </div>

          {/* Transactions for this date */}
          <div className="space-y-2">
            {group.transactions.map((tx) => (
              <div
                key={tx.id}
                className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Category icon */}
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                      style={{ backgroundColor: tx.category.color || '#3B82F6' }}
                    >
                      {tx.category.icon || '📦'}
                    </div>

                    {/* Transaction details */}
                    <div>
                      <p className="font-medium">{tx.category.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{tx.account.name}</span>
                        {tx.note && (
                          <>
                            <span>•</span>
                            <span>{tx.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      -₱{fromCentavos(tx.allocationAmount)}
                    </p>
                    {tx.allocationAmount !== tx.amount && (
                      <p className="text-xs text-muted-foreground">
                        of ₱{fromCentavos(tx.amount)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
