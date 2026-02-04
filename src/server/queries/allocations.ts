import { db } from '@/db';
import { allocations } from '@/db/schema/core';
import { eq, and } from 'drizzle-orm';

export type Envelope = {
  id: string;
  name: string;
  icon: string | null;
  currentAmount: number;
  targetAmount: number | null;
  categoryIds: string[] | null;
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
      currentAmount: allocations.currentAmount,
      targetAmount: allocations.targetAmount,
      categoryIds: allocations.categoryIds,
    })
    .from(allocations)
    .where(
      and(
        eq(allocations.userId, userId),
        eq(allocations.moduleType, 'envelope'),
        eq(allocations.isActive, true)
      )
    );

  return envelopes;
}
