import { db } from '@/db';
import { transactions, allocations } from '@/db/schema';
import { eq, and, gte, lte, sql, sum } from 'drizzle-orm';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, subWeeks } from 'date-fns';

export type Nudge = {
  id: string;
  type: 'info' | 'warning' | 'success' | 'celebration';
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
};

export async function getUserNudges(
  userId: string,
  activeModuleIds: string[]
): Promise<Nudge[]> {
  const nudges: Nudge[] = [];
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Check if user logged anything today (for streak reminder)
  const todayTransactions = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.date, todayStr)
      )
    );

  if (todayTransactions[0]?.count === 0) {
    nudges.push({
      id: 'no-log-today',
      type: 'info',
      icon: '📝',
      title: "You haven't logged anything today",
      description: "Keep your streak going by logging a transaction!",
      action: {
        label: 'Log Now',
        href: '#quick-add',
      },
    });
  }

  // Compare this week vs last week spending
  const thisWeekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const thisWeekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const lastWeekStart = format(startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const lastWeekEnd = format(endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const [thisWeekSpending, lastWeekSpending] = await Promise.all([
    db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'expense'),
          gte(transactions.date, thisWeekStart),
          lte(transactions.date, thisWeekEnd)
        )
      ),
    db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'expense'),
          gte(transactions.date, lastWeekStart),
          lte(transactions.date, lastWeekEnd)
        )
      ),
  ]);

  const thisWeekTotal = Number(thisWeekSpending[0]?.total || 0);
  const lastWeekTotal = Number(lastWeekSpending[0]?.total || 0);

  if (lastWeekTotal > 0 && thisWeekTotal > lastWeekTotal * 1.2) {
    const diff = thisWeekTotal - lastWeekTotal;
    nudges.push({
      id: 'spending-increase',
      type: 'warning',
      icon: '📈',
      title: 'Spending is up this week',
      description: `You've spent ₱${(diff / 100).toLocaleString()} more than last week.`,
      action: {
        label: 'View Statistics',
        href: '/statistics',
      },
    });
  }

  // Envelope nudges
  if (activeModuleIds.includes('envelope')) {
    const envelopes = await db
      .select()
      .from(allocations)
      .where(
        and(
          eq(allocations.userId, userId),
          eq(allocations.moduleType, 'envelope'),
          eq(allocations.isActive, true)
        )
      );

    for (const envelope of envelopes) {
      if (envelope.targetAmount && envelope.targetAmount > 0) {
        const percentUsed = (envelope.currentAmount / envelope.targetAmount) * 100;
        const dayOfMonth = today.getDate();

        // Warning if >80% spent before mid-month
        if (percentUsed >= 80 && dayOfMonth <= 15) {
          nudges.push({
            id: `envelope-warning-${envelope.id}`,
            type: 'warning',
            icon: '⚠️',
            title: `${envelope.name} is running low`,
            description: `${percentUsed.toFixed(0)}% spent and it's only the ${dayOfMonth}th.`,
            action: {
              label: 'View Envelope',
              href: `/modules/envelopes/${envelope.id}`,
            },
          });
        }
      }
    }
  }

  // Goals nudges
  if (activeModuleIds.includes('goals')) {
    const goals = await db
      .select()
      .from(allocations)
      .where(
        and(
          eq(allocations.userId, userId),
          eq(allocations.moduleType, 'goal'),
          eq(allocations.isActive, true)
        )
      );

    for (const goal of goals) {
      if (goal.targetAmount && goal.targetAmount > 0) {
        const remaining = goal.targetAmount - goal.currentAmount;
        const percentComplete = (goal.currentAmount / goal.targetAmount) * 100;

        // Celebration if close to goal (90%+)
        if (percentComplete >= 90 && percentComplete < 100) {
          nudges.push({
            id: `goal-close-${goal.id}`,
            type: 'celebration',
            icon: '🎉',
            title: `Almost there!`,
            description: `You're ₱${(remaining / 100).toLocaleString()} away from ${goal.name}!`,
            action: {
              label: 'View Goal',
              href: `/modules/goals/${goal.id}`,
            },
          });
        }
      }
    }

    // Check if no contributions this month
    const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');

    const monthlyContributions = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'income'),
          gte(transactions.date, monthStart),
          lte(transactions.date, monthEnd)
        )
      );

    if (
      goals.length > 0 &&
      monthlyContributions[0]?.count === 0 &&
      today.getDate() >= 15
    ) {
      nudges.push({
        id: 'no-goal-contribution',
        type: 'info',
        icon: '🎯',
        title: "Haven't saved this month yet",
        description: 'Consider contributing to one of your savings goals.',
        action: {
          label: 'View Goals',
          href: '/modules/goals',
        },
      });
    }
  }

  // Return only top 3 nudges to avoid overwhelming the user
  return nudges.slice(0, 3);
}
