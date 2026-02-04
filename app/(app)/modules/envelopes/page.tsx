import { createClient } from '@/lib/supabase/server';
import { getActiveEnvelopes } from '@/server/queries/allocations';
import { checkAndResetEnvelopePeriods } from '@/server/actions/envelopes';
import { EnvelopesList } from '@/components/envelopes/envelopes-list';

export default async function EnvelopesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Check and reset envelope periods before fetching
  await checkAndResetEnvelopePeriods(user.id);

  // Fetch active envelopes for this user
  const envelopes = await getActiveEnvelopes(user.id);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <EnvelopesList envelopes={envelopes} />
      </div>
    </div>
  );
}
