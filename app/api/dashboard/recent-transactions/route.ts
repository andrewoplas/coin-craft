import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRecentTransactions } from '@/server/queries/dashboard';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const transactions = await getRecentTransactions(user.id, limit);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Failed to get recent transactions:', error);
    return NextResponse.json(
      { error: 'Failed to load recent transactions' },
      { status: 500 }
    );
  }
}
