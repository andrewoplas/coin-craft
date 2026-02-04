'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { allocations } from '@/db/schema';
import { toCentavos } from '@/lib/format';

export type CreateEnvelopeInput = {
  name: string;
  emoji?: string;
  color?: string;
  targetAmount: number; // in pesos
  period: 'weekly' | 'monthly';
  rolloverEnabled: boolean;
};

export type CreateEnvelopeResult = {
  success: boolean;
  envelopeId?: string;
  error?: string;
};

export type UpdateEnvelopeInput = {
  envelopeId: string;
  name?: string;
  icon?: string;
  color?: string;
  targetAmount?: number; // in pesos
  period?: 'weekly' | 'monthly';
  rolloverEnabled?: boolean;
};

export type UpdateEnvelopeResult = {
  success: boolean;
  error?: string;
};

export type PauseEnvelopeInput = {
  envelopeId: string;
};

export type PauseEnvelopeResult = {
  success: boolean;
  error?: string;
};

export type TransferEnvelopeInput = {
  sourceEnvelopeId: string;
  targetEnvelopeId: string;
  amount: number; // in pesos
};

export type TransferEnvelopeResult = {
  success: boolean;
  error?: string;
};

/**
 * Server action to create a new envelope
 */
export async function createEnvelope(
  input: CreateEnvelopeInput
): Promise<CreateEnvelopeResult> {
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
      return { success: false, error: 'Envelope name is required' };
    }

    if (!input.period) {
      return { success: false, error: 'Period is required' };
    }

    // Validate target amount is positive
    if (input.targetAmount <= 0) {
      return { success: false, error: 'Target amount must be greater than 0' };
    }

    // Convert target amount to centavos
    const targetAmountInCentavos = toCentavos(input.targetAmount);

    // Get current date for period start (YYYY-MM-DD format)
    const today = new Date();
    const periodStart = today.toISOString().split('T')[0];

    // Store rollover config as JSON string
    const config = JSON.stringify({
      rolloverEnabled: input.rolloverEnabled,
    });

    // Insert envelope into allocations table
    const [envelope] = await db
      .insert(allocations)
      .values({
        userId: user.id,
        moduleType: 'envelope',
        name: input.name.trim(),
        icon: input.emoji || '💰',
        color: input.color || null,
        targetAmount: targetAmountInCentavos,
        currentAmount: 0,
        period: input.period,
        periodStart: periodStart,
        deadline: null,
        categoryIds: [],
        isActive: true,
        config: config,
        sortOrder: 0,
      })
      .returning({ id: allocations.id });

    // Revalidate pages to refresh server components
    revalidatePath('/modules/envelopes');
    revalidatePath('/dashboard');

    return { success: true, envelopeId: envelope.id };
  } catch (error) {
    console.error('Error creating envelope:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create envelope',
    };
  }
}

/**
 * Server action to update an existing envelope
 * Allows updating name, icon, color, targetAmount, period, and rollover config
 */
export async function updateEnvelope(
  input: UpdateEnvelopeInput
): Promise<UpdateEnvelopeResult> {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch existing envelope and verify ownership
    const [existingEnvelope] = await db
      .select()
      .from(allocations)
      .where(eq(allocations.id, input.envelopeId))
      .limit(1);

    if (!existingEnvelope) {
      return { success: false, error: 'Envelope not found' };
    }

    if (existingEnvelope.userId !== user.id) {
      return { success: false, error: 'Not authorized to update this envelope' };
    }

    if (existingEnvelope.moduleType !== 'envelope') {
      return { success: false, error: 'This allocation is not an envelope' };
    }

    // Validate name if provided
    if (input.name !== undefined && !input.name.trim()) {
      return { success: false, error: 'Envelope name cannot be empty' };
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
      period?: 'weekly' | 'monthly';
      config?: string;
    } = {};

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

    if (input.period !== undefined) {
      updateData.period = input.period;
    }

    // Handle rolloverEnabled config update
    if (input.rolloverEnabled !== undefined) {
      // Parse existing config
      let existingConfig = {};
      try {
        existingConfig = existingEnvelope.config
          ? JSON.parse(existingEnvelope.config)
          : {};
      } catch {
        existingConfig = {};
      }

      // Merge with new rolloverEnabled value
      const newConfig = {
        ...existingConfig,
        rolloverEnabled: input.rolloverEnabled,
      };

      updateData.config = JSON.stringify(newConfig);
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return { success: true };
    }

    // Update envelope
    await db
      .update(allocations)
      .set(updateData)
      .where(eq(allocations.id, input.envelopeId));

    // Revalidate pages to refresh server components
    revalidatePath('/modules/envelopes');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error updating envelope:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update envelope',
    };
  }
}

/**
 * Server action to pause an envelope (soft delete)
 * Sets isActive=false to hide envelope while preserving all data
 */
export async function pauseEnvelope(
  input: PauseEnvelopeInput
): Promise<PauseEnvelopeResult> {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch existing envelope and verify ownership
    const [existingEnvelope] = await db
      .select()
      .from(allocations)
      .where(eq(allocations.id, input.envelopeId))
      .limit(1);

    if (!existingEnvelope) {
      return { success: false, error: 'Envelope not found' };
    }

    if (existingEnvelope.userId !== user.id) {
      return { success: false, error: 'Not authorized to pause this envelope' };
    }

    if (existingEnvelope.moduleType !== 'envelope') {
      return { success: false, error: 'This allocation is not an envelope' };
    }

    // Pause envelope by setting isActive=false
    await db
      .update(allocations)
      .set({ isActive: false })
      .where(eq(allocations.id, input.envelopeId));

    // Revalidate pages to refresh server components
    revalidatePath('/modules/envelopes');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error pausing envelope:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to pause envelope',
    };
  }
}

/**
 * Server action to transfer budget allocation between envelopes
 * Moves targetAmount from source envelope to target envelope
 */
export async function transferBetweenEnvelopes(
  input: TransferEnvelopeInput
): Promise<TransferEnvelopeResult> {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate inputs
    if (!input.sourceEnvelopeId || !input.targetEnvelopeId) {
      return { success: false, error: 'Source and target envelopes are required' };
    }

    if (input.sourceEnvelopeId === input.targetEnvelopeId) {
      return { success: false, error: 'Cannot transfer to the same envelope' };
    }

    if (input.amount <= 0) {
      return { success: false, error: 'Transfer amount must be greater than 0' };
    }

    // Convert amount to centavos
    const amountInCentavos = toCentavos(input.amount);

    // Fetch source envelope and verify ownership
    const [sourceEnvelope] = await db
      .select()
      .from(allocations)
      .where(eq(allocations.id, input.sourceEnvelopeId))
      .limit(1);

    if (!sourceEnvelope) {
      return { success: false, error: 'Source envelope not found' };
    }

    if (sourceEnvelope.userId !== user.id) {
      return { success: false, error: 'Not authorized to transfer from this envelope' };
    }

    if (sourceEnvelope.moduleType !== 'envelope') {
      return { success: false, error: 'Source is not an envelope' };
    }

    if (!sourceEnvelope.isActive) {
      return { success: false, error: 'Cannot transfer from a paused envelope' };
    }

    // Validate source has enough budget to transfer
    const sourceTargetAmount = sourceEnvelope.targetAmount || 0;
    if (sourceTargetAmount < amountInCentavos) {
      return { success: false, error: 'Source envelope does not have enough budget to transfer' };
    }

    // Fetch target envelope and verify ownership
    const [targetEnvelope] = await db
      .select()
      .from(allocations)
      .where(eq(allocations.id, input.targetEnvelopeId))
      .limit(1);

    if (!targetEnvelope) {
      return { success: false, error: 'Target envelope not found' };
    }

    if (targetEnvelope.userId !== user.id) {
      return { success: false, error: 'Not authorized to transfer to this envelope' };
    }

    if (targetEnvelope.moduleType !== 'envelope') {
      return { success: false, error: 'Target is not an envelope' };
    }

    if (!targetEnvelope.isActive) {
      return { success: false, error: 'Cannot transfer to a paused envelope' };
    }

    // Perform the transfer: update both envelopes in a transaction
    // Source: decrease targetAmount
    const newSourceTargetAmount = sourceTargetAmount - amountInCentavos;
    await db
      .update(allocations)
      .set({ targetAmount: newSourceTargetAmount })
      .where(eq(allocations.id, input.sourceEnvelopeId));

    // Target: increase targetAmount
    const targetTargetAmount = targetEnvelope.targetAmount || 0;
    const newTargetTargetAmount = targetTargetAmount + amountInCentavos;
    await db
      .update(allocations)
      .set({ targetAmount: newTargetTargetAmount })
      .where(eq(allocations.id, input.targetEnvelopeId));

    // Revalidate pages to refresh server components
    revalidatePath('/modules/envelopes');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error transferring between envelopes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to transfer between envelopes',
    };
  }
}
