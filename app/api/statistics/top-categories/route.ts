import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTopCategories, getDateRangeFromPeriod } from '@/server/queries/statistics';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get top categories for this month
    const { dateFrom, dateTo } = getDateRangeFromPeriod('this-month');
    const data = await getTopCategories(user.id, dateFrom, dateTo, 5);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to get top categories:', error);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}
