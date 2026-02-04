import type { TransactionWithRelations } from '@/server/queries/transactions';
import { TransactionRow } from './transaction-row';
import { isToday, isYesterday, parseISO, format } from 'date-fns';

type TransactionListProps = {
  transactions: TransactionWithRelations[];
};

type TransactionGroup = {
  date: string;
  label: string;
  transactions: TransactionWithRelations[];
};

function groupTransactionsByDate(
  transactions: TransactionWithRelations[]
): TransactionGroup[] {
  // Group transactions by date string
  const groupsMap = new Map<string, TransactionWithRelations[]>();

  for (const transaction of transactions) {
    const dateKey = transaction.date; // YYYY-MM-DD format
    if (!groupsMap.has(dateKey)) {
      groupsMap.set(dateKey, []);
    }
    groupsMap.get(dateKey)!.push(transaction);
  }

  // Convert to array and create labels
  const groups: TransactionGroup[] = [];
  for (const [date, txs] of groupsMap) {
    const parsedDate = parseISO(date);
    let label: string;

    if (isToday(parsedDate)) {
      label = 'Today';
    } else if (isYesterday(parsedDate)) {
      label = 'Yesterday';
    } else {
      label = format(parsedDate, 'MMMM d, yyyy');
    }

    groups.push({ date, label, transactions: txs });
  }

  // Sort groups by date descending (newest first)
  groups.sort((a, b) => b.date.localeCompare(a.date));

  return groups;
}

export function TransactionList({ transactions }: TransactionListProps) {
  const groups = groupTransactionsByDate(transactions);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.date}>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-4">
            {group.label}
          </h2>
          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
            {group.transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
