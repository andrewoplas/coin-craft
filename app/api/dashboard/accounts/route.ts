import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAccountsWithBalances } from '@/server/queries/accounts';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await getAccountsWithBalances(user.id);
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Failed to get accounts:', error);
    return NextResponse.json(
      { error: 'Failed to load accounts' },
      { status: 500 }
    );
  }
}
