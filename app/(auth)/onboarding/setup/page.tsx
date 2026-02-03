'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CHARACTERS } from '@/lib/constants';
import { completeSetup } from '@/server/actions/onboarding';
import { toCentavos } from '@/lib/format';

type Account = {
  name: string;
  type: 'cash' | 'bank' | 'e_wallet' | 'credit_card';
  initialBalance: number;
  icon: string;
  color: string;
};

const accountTypes = [
  { value: 'cash' as const, label: 'Cash', icon: '💵' },
  { value: 'bank' as const, label: 'Bank', icon: '🏦' },
  { value: 'e_wallet' as const, label: 'E-Wallet', icon: '📱' },
  { value: 'credit_card' as const, label: 'Credit Card', icon: '💳' },
];

const defaultColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1'];

export default function SetupPage() {
  const router = useRouter();
  const [characterId, setCharacterId] = useState<string>('');
  const [step, setStep] = useState(1);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Partial<Account>>({
    name: '',
    type: 'bank',
    initialBalance: 0,
    icon: '🏦',
    color: defaultColors[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedCharacter');
    if (!stored) {
      router.push('/onboarding');
      return;
    }
    setCharacterId(stored);
  }, [router]);

  if (!characterId) {
    return null;
  }

  const character = CHARACTERS[characterId];
  const totalSteps = 2; // Add accounts, Done (categories are auto-seeded)

  const handleAddAccount = () => {
    if (!currentAccount.name) return;

    setAccounts([
      ...accounts,
      {
        name: currentAccount.name,
        type: currentAccount.type!,
        initialBalance: currentAccount.initialBalance!,
        icon: currentAccount.icon!,
        color: currentAccount.color!,
      },
    ]);

    setCurrentAccount({
      name: '',
      type: 'bank',
      initialBalance: 0,
      icon: '🏦',
      color: defaultColors[accounts.length % defaultColors.length],
    });
  };

  const handleRemoveAccount = (index: number) => {
    setAccounts(accounts.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleComplete = async () => {
    if (accounts.length === 0) {
      alert('Please add at least one account');
      return;
    }

    setIsSubmitting(true);

    try {
      await completeSetup({
        characterId,
        accounts: accounts.map((acc) => ({
          ...acc,
          initialBalance: toCentavos(acc.initialBalance),
        })),
      });
    } catch (error) {
      console.error('Setup failed:', error);
      alert('Setup failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (type: typeof currentAccount.type) => {
    const icon = accountTypes.find((t) => t.value === type)?.icon || '🏦';
    setCurrentAccount({ ...currentAccount, type, icon });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-6 flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-colors ${
                index < step ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-2">{character.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Setting up {character.name}
            </h2>
          </div>

          {step === 1 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add your accounts</h3>
              <p className="text-gray-600 mb-6">
                Where does your money live? Add your cash, bank accounts, e-wallets, etc.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account name
                  </label>
                  <input
                    type="text"
                    value={currentAccount.name}
                    onChange={(e) =>
                      setCurrentAccount({ ...currentAccount, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. BDO Savings, GCash"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {accountTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleTypeChange(type.value)}
                        className={`p-3 border-2 rounded-lg text-center transition-all ${
                          currentAccount.type === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-xs text-gray-600">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial balance (₱)
                  </label>
                  <input
                    type="number"
                    value={currentAccount.initialBalance}
                    onChange={(e) =>
                      setCurrentAccount({
                        ...currentAccount,
                        initialBalance: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddAccount}
                  disabled={!currentAccount.name}
                  className="w-full py-2 px-4 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Add account
                </button>
              </div>

              {accounts.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Your accounts</h4>
                  <div className="space-y-2">
                    {accounts.map((account, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{account.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">{account.name}</div>
                            <div className="text-sm text-gray-600">
                              ₱{account.initialBalance.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAccount(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={accounts.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">All set!</h3>
              <p className="text-gray-600 mb-6">
                You're ready to start tracking your money with {character.name}.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">What you'll get:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ {accounts.length} account(s) ready to track</li>
                  <li>✓ Default categories for expenses and income</li>
                  <li>✓ {character.modules.length} module(s): {character.modules.join(', ')}</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleComplete}
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Setting up...' : 'Start using CoinCraft'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
