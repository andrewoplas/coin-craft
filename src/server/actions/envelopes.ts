'use server';

import { revalidatePath } from 'next/cache';
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
