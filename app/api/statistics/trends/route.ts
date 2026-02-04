import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSpendingTrends } from '@/server/queries/statistics';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getSpendingTrends(user.id, 6);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to get spending trends:', error);
    return NextResponse.json({ error: 'Failed to load trends' }, { status: 500 });
  }
}
