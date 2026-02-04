import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateHealthScore } from '@/server/queries/health-score';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const healthScore = await calculateHealthScore(user.id);

    return NextResponse.json(healthScore);
  } catch (error) {
    console.error('Error fetching health score:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health score' },
      { status: 500 }
    );
  }
}
