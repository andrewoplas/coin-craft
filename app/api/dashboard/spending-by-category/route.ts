import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSpendingByCategory } from '@/server/queries/dashboard';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const spending = await getSpendingByCategory(user.id);
    return NextResponse.json(spending);
  } catch (error) {
    console.error('Failed to get spending by category:', error);
    return NextResponse.json(
      { error: 'Failed to load spending by category' },
      { status: 500 }
    );
  }
}
