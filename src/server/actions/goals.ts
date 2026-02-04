'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { allocations } from '@/db/schema';
import { toCentavos } from '@/lib/format';

export type CreateGoalInput = {
  name: string;
  emoji?: string;
  color?: string;
  targetAmount: number; // in pesos
  deadline?: string; // YYYY-MM-DD or empty
};

export type CreateGoalResult = {
  success: boolean;
  goalId?: string;
  error?: string;
};

export type UpdateGoalInput = {
  goalId: string;
  name?: string;
  icon?: string;
  color?: string;
  targetAmount?: number; // in pesos
  deadline?: string | null; // null to remove deadline
};

export type UpdateGoalResult = {
  success: boolean;
  error?: string;
};

export type GoalActionInput = {
  goalId: string;
};

export type GoalActionResult = {
  success: boolean;
  error?: string;
};

/**
 * Server action to create a new savings goal
 */
export async function createGoal(input: CreateGoalInput): Promise<CreateGoalResult> {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate required fields
    if (!input.name?.trim()) {
      return { success: false, error: 'Goal name is required' };
    }

    // Validate target amount is positive
    if (input.targetAmount <= 0) {
      return { success: false, error: 'Target amount must be greater than 0' };
    }

    // Convert target amount to centavos
    const targetAmountInCentavos = toCentavos(input.targetAmount);

    // Insert goal into allocations table
    const [goal] = await db
      .insert(allocations)
      .values({
        userId: user.id,
        moduleType: 'goal',
        name: input.name.trim(),
        icon: input.emoji || '🎯',
        color: input.color || null,
        targetAmount: targetAmountInCentavos,
        currentAmount: 0,
        period: 'none',
        periodStart: null,
        deadline: input.deadline || null,
        categoryIds: [],
        isActive: true,
        config: JSON.stringify({}),
        sortOrder: 0,
      })
      .returning({ id: allocations.id });

    // Revalidate pages to refresh server components
    revalidatePath('/modules/goals');
    revalidatePath('/dashboard');

    return { success: true, goalId: goal.id };
  } catch (error) {
    console.error('Error creating goal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create goal',
    };
  }
}

/**
 * Server action to update an existing goal
 */
export async function updateGoal(input: UpdateGoalInput): Promise<UpdateGoalResult> {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch existing goal and verify ownership
    const [existingGoal] = await db
      .select()
      .from(allocations)
      .where(eq(allocations.id, input.goalId))
      .limit(1);

    if (!existingGoal) {
      return { success: false, error: 'Goal not found' };
    }

    if (existingGoal.userId !== user.id) {
      return { success: false, error: 'Not authorized to update this goal' };
    }

    if (existingGoal.moduleType !== 'goal') {
      return { success: false, error: 'This allocation is not a goal' };
    }

    // Validate name if provided
    if (input.name !== undefined && !input.name.trim()) {
      return { success: false, error: 'Goal name cannot be empty' };
    }

    // Validate target amount if provided
    if (input.targetAmount !== undefined && input.targetAmount <= 0) {
      return { success: false, error: 'Target amount must be greater than 0' };
    }

    // Build update object with only changed fields
    const updateData: {
      name?: string;
      icon?: string | null;
      color?: string | null;
      targetAmount?: number;
      deadline?: string | null;
      updatedAt?: Date;
    } = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) {
      updateData.name = input.name.trim();
    }

    if (input.icon !== undefined) {
      updateData.icon = input.icon || null;
    }

    if (input.color !== undefined) {
      updateData.color = input.color || null;
    }

    if (input.targetAmount !== undefined) {
      updateData.targetAmount = toCentavos(input.targetAmount);
    }

    if (input.deadline !== undefined) {
      updateData.deadline = input.deadline || null;
    }

    // Update goal
    await db
      .update(allocations)
      .set(updateData)
      .where(eq(allocations.id, input.goalId));

    // Revalidate pages
    revalidatePath('/modules/goals');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error updating goal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update goal',
    };
  }
}

/**
 * Server action to pause a goal (sets isActive=false)
 */
export async function pauseGoal(input: GoalActionInput): Promise<GoalActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch existing goal and verify ownership
    const [existingGoal] = await db
      .select()
      .from(allocations)
      .where(eq(allocations.id, input.goalId))
      .limit(1);

    if (!existingGoal) {
      return { success: false, error: 'Goal not found' };
    }

    if (existingGoal.userId !== user.id) {
      return { success: false, error: 'Not authorized to pause this goal' };
    }

    if (existingGoal.moduleType !== 'goal') {
      return { success: false, error: 'This allocation is not a goal' };
    }

    // Pause goal by setting isActive=false
    await db
      .update(allocations)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(allocations.id, input.goalId));

    revalidatePath('/modules/goals');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error pausing goal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to pause goal',
    };
  }
}

/**
 * Server action to abandon a goal (soft delete)
 */
export async function abandonGoal(input: GoalActionInput): Promise<GoalActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch existing goal and verify ownership
    const [existingGoal] = await db
      .select()
      .from(allocations)
      .where(eq(allocations.id, input.goalId))
      .limit(1);

    if (!existingGoal) {
      return { success: false, error: 'Goal not found' };
    }

    if (existingGoal.userId !== user.id) {
      return { success: false, error: 'Not authorized to abandon this goal' };
    }

    if (existingGoal.moduleType !== 'goal') {
      return { success: false, error: 'This allocation is not a goal' };
    }

    // Update config to mark as abandoned and set inactive
    let config = {};
    try {
      config = existingGoal.config ? JSON.parse(existingGoal.config) : {};
    } catch {
      config = {};
    }

    const updatedConfig = {
      ...config,
      status: 'abandoned',
      abandonedAt: new Date().toISOString(),
    };

    await db
      .update(allocations)
      .set({
        isActive: false,
        config: JSON.stringify(updatedConfig),
        updatedAt: new Date(),
      })
      .where(eq(allocations.id, input.goalId));

    revalidatePath('/modules/goals');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error abandoning goal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to abandon goal',
    };
  }
}

/**
 * Server action to mark a goal as completed
 */
export async function completeGoal(input: GoalActionInput): Promise<GoalActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch existing goal and verify ownership
    const [existingGoal] = await db
      .select()
      .from(allocations)
      .where(eq(allocations.id, input.goalId))
      .limit(1);

    if (!existingGoal) {
      return { success: false, error: 'Goal not found' };
    }

    if (existingGoal.userId !== user.id) {
      return { success: false, error: 'Not authorized to complete this goal' };
    }

    if (existingGoal.moduleType !== 'goal') {
      return { success: false, error: 'This allocation is not a goal' };
    }

    // Update config to mark as completed
    let config = {};
    try {
      config = existingGoal.config ? JSON.parse(existingGoal.config) : {};
    } catch {
      config = {};
    }

    const updatedConfig = {
      ...config,
      status: 'completed',
      completedAt: new Date().toISOString(),
    };

    await db
      .update(allocations)
      .set({
        isActive: false,
        config: JSON.stringify(updatedConfig),
        updatedAt: new Date(),
      })
      .where(eq(allocations.id, input.goalId));

    revalidatePath('/modules/goals');
    revalidatePath('/dashboard');

    // TODO: Trigger achievement unlock for goal completion

    return { success: true };
  } catch (error) {
    console.error('Error completing goal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete goal',
    };
  }
}

export type ContributeToGoalInput = {
  goalId: string;
  amount: number; // in pesos
};

/**
 * Server action to manually contribute to a goal
 * This directly increases the goal's currentAmount
 */
export async function contributeToGoal(input: ContributeToGoalInput): Promise<GoalActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (input.amount <= 0) {
      return { success: false, error: 'Contribution amount must be greater than 0' };
    }

    // Fetch existing goal and verify ownership
    const [existingGoal] = await db
      .select()
      .from(allocations)
      .where(eq(allocations.id, input.goalId))
      .limit(1);

    if (!existingGoal) {
      return { success: false, error: 'Goal not found' };
    }

    if (existingGoal.userId !== user.id) {
      return { success: false, error: 'Not authorized to contribute to this goal' };
    }

    if (existingGoal.moduleType !== 'goal') {
      return { success: false, error: 'This allocation is not a goal' };
    }

    if (!existingGoal.isActive) {
      return { success: false, error: 'Cannot contribute to an inactive goal' };
    }

    // Convert amount to centavos and add to current amount
    const amountInCentavos = toCentavos(input.amount);
    const newCurrentAmount = existingGoal.currentAmount + amountInCentavos;

    await db
      .update(allocations)
      .set({
        currentAmount: newCurrentAmount,
        updatedAt: new Date(),
      })
      .where(eq(allocations.id, input.goalId));

    revalidatePath('/modules/goals');
    revalidatePath(`/modules/goals/${input.goalId}`);
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error contributing to goal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to contribute to goal',
    };
  }
}
