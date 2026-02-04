'use client';

import { GoalContribution } from '@/server/queries/goals';
import { formatPHP } from '@/lib/format';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

type GoalContributionsListProps = {
  contributions: GoalContribution[];
};

export function GoalContributionsList({ contributions }: GoalContributionsListProps) {
  // Group contributions by date
  const groupedContributions = contributions.reduce<Record<string, GoalContribution[]>>(
    (acc, contribution) => {
      const date = contribution.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(contribution);
      return acc;
    },
    {}
  );

  const formatDateLabel = (dateStr: string): string => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  if (contributions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-4">💰</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No contributions yet</h3>
        <p className="text-gray-500 text-sm">
          Add your first contribution to start tracking your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Contribution History</h3>
        <p className="text-sm text-gray-500">{contributions.length} contribution{contributions.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="divide-y divide-gray-100">
        {Object.entries(groupedContributions).map(([date, dateContributions]) => (
          <div key={date}>
            {/* Date header */}
            <div className="px-6 py-2 bg-gray-50">
              <span className="text-sm font-medium text-gray-500">
                {formatDateLabel(date)}
              </span>
            </div>

            {/* Contributions for this date */}
            {dateContributions.map((contribution) => (
              <div
                key={contribution.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-lg">{contribution.category.icon || '💵'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {contribution.category.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {contribution.account.name}
                        {contribution.note && ` • ${contribution.note}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-green-600">
                    +{formatPHP(contribution.contributionAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
