'use server';

import { db } from '@/db';
import { dashboardLayouts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { type WidgetInstance } from '@/lib/types';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Get user's saved dashboard layout
 */
export async function getDashboardLayout(): Promise<ActionResult<WidgetInstance[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const [result] = await db
      .select({ layout: dashboardLayouts.layout })
      .from(dashboardLayouts)
      .where(eq(dashboardLayouts.userId, user.id))
      .limit(1);

    if (!result) {
      return { success: true, data: [] };
    }

    try {
      const layout = JSON.parse(result.layout) as WidgetInstance[];
      return { success: true, data: layout };
    } catch {
      return { success: true, data: [] };
    }
  } catch (error) {
    console.error('Failed to get dashboard layout:', error);
    return { success: false, error: 'Failed to load dashboard layout' };
  }
}

/**
 * Save user's dashboard layout
 */
export async function saveDashboardLayout(layout: WidgetInstance[]): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const layoutJson = JSON.stringify(layout);

    // Upsert the layout
    const existing = await db
      .select({ id: dashboardLayouts.id })
      .from(dashboardLayouts)
      .where(eq(dashboardLayouts.userId, user.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(dashboardLayouts)
        .set({ layout: layoutJson, updatedAt: new Date() })
        .where(eq(dashboardLayouts.userId, user.id));
    } else {
      await db.insert(dashboardLayouts).values({
        userId: user.id,
        layout: layoutJson,
      });
    }

    revalidatePath('/dashboard');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Failed to save dashboard layout:', error);
    return { success: false, error: 'Failed to save dashboard layout' };
  }
}

/**
 * Reset dashboard to default layout based on character
 */
export async function resetDashboardLayout(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Delete existing layout to reset to default
    await db
      .delete(dashboardLayouts)
      .where(eq(dashboardLayouts.userId, user.id));

    revalidatePath('/dashboard');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Failed to reset dashboard layout:', error);
    return { success: false, error: 'Failed to reset dashboard layout' };
  }
}
