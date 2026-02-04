import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDashboardStats } from '@/server/queries/dashboard';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getDashboardStats(user.id);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to get dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard stats' },
      { status: 500 }
    );
  }
}
