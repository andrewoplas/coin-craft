import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/server/queries/user';
import { CHARACTERS } from '@/lib/constants';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await getUserProfile(user.id);
  const character = profile?.characterId ? CHARACTERS[profile.characterId] : null;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          {character && (
            <p className="text-gray-600">
              Welcome back, {character.name}! {character.icon}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Net Worth</h3>
            <p className="text-3xl font-bold text-gray-900">₱0.00</p>
            <p className="text-sm text-gray-500 mt-2">Coming soon</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">This Month</h3>
            <p className="text-3xl font-bold text-gray-900">₱0.00</p>
            <p className="text-sm text-gray-500 mt-2">Income - Expenses</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Transactions</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500 mt-2">This month</p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-500 text-center py-8">
            No transactions yet. Add your first transaction to get started!
          </p>
        </div>
      </div>
    </div>
  );
}
