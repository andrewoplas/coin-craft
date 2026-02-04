import { db } from '@/db';
import { allocations } from '@/db/schema/core';
import { eq, and } from 'drizzle-orm';

export type Envelope = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  currentAmount: number;
  targetAmount: number | null;
  period: string | null;
  periodStart: string | null;
  config: string | null;
  categoryIds: string[] | null;
  sortOrder: number;
};

export type Goal = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  currentAmount: number;
  targetAmount: number | null;
  deadline: string | null;
  config: string | null;
  createdAt: Date;
  sortOrder: number;
};

/**
 * Fetch active envelopes for a user
 */
export async function getActiveEnvelopes(userId: string): Promise<Envelope[]> {
  const envelopes = await db
    .select({
      id: allocations.id,
      name: allocations.name,
      icon: allocations.icon,
      color: allocations.color,
      currentAmount: allocations.currentAmount,
      targetAmount: allocations.targetAmount,
      period: allocations.period,
      periodStart: allocations.periodStart,
      config: allocations.config,
      categoryIds: allocations.categoryIds,
      sortOrder: allocations.sortOrder,
    })
    .from(allocations)
    .where(
      and(
        eq(allocations.userId, userId),
        eq(allocations.moduleType, 'envelope'),
        eq(allocations.isActive, true)
      )
    )
    .orderBy(allocations.sortOrder);

  return envelopes;
}

/**
 * Fetch active goals for a user
 */
export async function getActiveGoals(userId: string): Promise<Goal[]> {
  const goals = await db
    .select({
      id: allocations.id,
      name: allocations.name,
      icon: allocations.icon,
      color: allocations.color,
      currentAmount: allocations.currentAmount,
      targetAmount: allocations.targetAmount,
      deadline: allocations.deadline,
      config: allocations.config,
      createdAt: allocations.createdAt,
      sortOrder: allocations.sortOrder,
    })
    .from(allocations)
    .where(
      and(
        eq(allocations.userId, userId),
        eq(allocations.moduleType, 'goal'),
        eq(allocations.isActive, true)
      )
    )
    .orderBy(allocations.sortOrder);

  return goals;
}
