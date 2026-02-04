import { createClient } from '@/lib/supabase/server';
import { getAccountsWithBalances } from '@/server/queries/accounts';
import { formatPHP } from '@/lib/format';
import { AccountsList } from '@/components/accounts/accounts-list';
import { AccountsHeader } from '@/components/accounts/accounts-header';

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch accounts with computed balances
  const accounts = await getAccountsWithBalances(user.id);

  // Calculate total balance across all accounts
  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <AccountsHeader />

        {/* Total Balance Summary */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-8">
          <div className="text-center">
            <p className="text-blue-100 text-sm font-medium mb-2">Total Balance</p>
            <p className="text-white text-4xl font-bold">{formatPHP(totalBalance)}</p>
            <p className="text-blue-100 text-sm mt-2">Across {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}</p>
          </div>
        </div>

        {/* Account cards */}
        <AccountsList accounts={accounts} />
      </div>
    </div>
  );
}
