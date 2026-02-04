import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStreak } from '@/server/queries/streaks';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const streak = await getStreak(user.id);

    return NextResponse.json(streak);
  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streak' },
      { status: 500 }
    );
  }
}
