import { createClient } from '@/lib/supabase/server';
import { signout } from '@/server/actions/auth';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <form action={signout}>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Welcome, {user?.email}! Dashboard coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
