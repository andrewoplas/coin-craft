import { signout } from '@/server/actions/auth';

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 mb-4">
            Full settings coming in Sprint 12
          </p>
          <form action={signout}>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
