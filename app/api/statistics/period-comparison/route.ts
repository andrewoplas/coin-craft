import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPeriodComparison } from '@/server/queries/statistics';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Default to this month vs last month comparison
    const data = await getPeriodComparison(user.id, 'this-month');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to get period comparison:', error);
    return NextResponse.json({ error: 'Failed to load comparison' }, { status: 500 });
  }
}
