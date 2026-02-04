import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMonthlyRecap, getRecapMonths } from '@/server/queries/monthly-recap';
import { MonthlyRecapClient } from '@/components/recap/monthly-recap-client';
import { format, parse, isValid } from 'date-fns';

type RecapPageProps = {
  params: Promise<{ month: string }>;
};

export default async function RecapPage({ params }: RecapPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { month } = await params;

  // Validate month format (YYYY-MM)
  const monthDate = parse(month + '-01', 'yyyy-MM-dd', new Date());
  if (!isValid(monthDate)) {
    notFound();
  }

  // Get available months for navigation
  const availableMonths = await getRecapMonths(user.id);

  // Get recap data for the requested month
  const recapData = await getMonthlyRecap(user.id, month);

  return (
    <MonthlyRecapClient
      data={recapData}
      availableMonths={availableMonths}
    />
  );
}
