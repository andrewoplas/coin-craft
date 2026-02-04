import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getIncomeVsExpenses } from '@/server/queries/dashboard';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getIncomeVsExpenses(user.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to get income vs expenses:', error);
    return NextResponse.json(
      { error: 'Failed to load income vs expenses' },
      { status: 500 }
    );
  }
}
