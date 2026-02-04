'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  ChevronRight,
  User,
  DollarSign,
  Calendar,
  Palette,
  Download,
  Trash2,
  LayoutDashboard,
  Package,
  Moon,
  Sun,
  Monitor,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { signout } from '@/server/actions/auth';
import { updateSettings, exportTransactionsCSV, deleteAccount } from '@/server/actions/settings';
import { resetDashboardLayout } from '@/server/actions/dashboard';
import { type UserSettings } from '@/lib/types';
import { CHARACTERS } from '@/lib/constants';

type Theme = 'light' | 'dark' | 'system';

type SettingsClientProps = {
  initialSettings: UserSettings;
  characterId: string | null;
};

export function SettingsClient({ initialSettings, characterId }: SettingsClientProps) {
  // General settings state
  const [displayName, setDisplayName] = useState(initialSettings.displayName || '');
  const [defaultCurrency, setDefaultCurrency] = useState(initialSettings.defaultCurrency || 'PHP');
  const [initialDayOfMonth, setInitialDayOfMonth] = useState(String(initialSettings.initialDayOfMonth || 1));
  const [dateFormat, setDateFormat] = useState(initialSettings.dateFormat || 'MMM d, yyyy');

  // Theme state
  const [theme, setTheme] = useState<Theme>(initialSettings.theme || 'light');

  // Loading states
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResettingDashboard, setIsResettingDashboard] = useState(false);

  const character = characterId ? CHARACTERS[characterId] : null;

  const handleSaveGeneralSettings = async () => {
    setIsSavingGeneral(true);
    try {
      const result = await updateSettings({
        displayName,
        defaultCurrency,
        initialDayOfMonth: parseInt(initialDayOfMonth, 10),
        dateFormat,
      });

      if (result.success) {
        toast.success('Settings saved successfully');
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const result = await exportTransactionsCSV();

      if (!result.success) {
        toast.error(result.error || 'Failed to export data');
        return;
      }

      // Create and download CSV file
      const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `coincraft-transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Export complete! Check your downloads.');
    } catch {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAccount();

      if (result.success) {
        toast.success('Account deleted');
        // Redirect to login page
        window.location.href = '/login';
      } else {
        toast.error(result.error || 'Failed to delete account');
      }
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetDashboard = async () => {
    setIsResettingDashboard(true);
    try {
      const result = await resetDashboardLayout();
      if (result.success) {
        toast.success('Dashboard reset to default layout');
      } else {
        toast.error(result.error || 'Failed to reset dashboard');
      }
    } catch {
      toast.error('Failed to reset dashboard');
    } finally {
      setIsResettingDashboard(false);
    }
  };

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      const result = await updateSettings({ theme: newTheme });
      if (result.success) {
        toast.success(`Theme changed to ${newTheme}`);
      } else {
        toast.error('Failed to save theme preference');
      }
    } catch {
      toast.error('Failed to save theme preference');
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Quick Links Section */}
        <div className="space-y-3 mb-8">
          <Link
            href="/settings/achievements"
            className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Achievements</p>
                <p className="text-sm text-gray-500">View your badges and progress</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        </div>

        {/* General Settings */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">General</h2>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PHP">PHP (Philippine Peso)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                  <SelectItem value="JPY">JPY (Japanese Yen)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dayOfMonth" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Initial Day of Month
              </Label>
              <Select value={initialDayOfMonth} onValueChange={setInitialDayOfMonth}>
                <SelectTrigger id="dayOfMonth">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={String(day)}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Budget periods will start on this day each month
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MMM d, yyyy">Feb 4, 2026</SelectItem>
                  <SelectItem value="d MMM yyyy">4 Feb 2026</SelectItem>
                  <SelectItem value="MM/dd/yyyy">02/04/2026</SelectItem>
                  <SelectItem value="dd/MM/yyyy">04/02/2026</SelectItem>
                  <SelectItem value="yyyy-MM-dd">2026-02-04</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSaveGeneralSettings}
              disabled={isSavingGeneral}
              className="mt-2"
            >
              {isSavingGeneral ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </section>

        {/* Character & Modules Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Package className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Character & Modules</h2>
          </div>

          {/* Current Character Display */}
          {character && (
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{character.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{character.name}</p>
                  <p className="text-sm text-gray-500">{character.tagline}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/settings/character"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">Change Character</p>
                <p className="text-sm text-gray-500">Switch your financial character</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>

            <Link
              href="/settings/modules"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">Module Library</p>
                <p className="text-sm text-gray-500">Browse and enable/disable modules</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </section>

        {/* Dashboard Settings */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <LayoutDashboard className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard?edit=true"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">Edit Dashboard Layout</p>
                <p className="text-sm text-gray-500">Customize your widget arrangement</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Reset to Default</p>
                  <p className="text-sm text-gray-500">Restore the default widget layout</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleResetDashboard}
                disabled={isResettingDashboard}
              >
                {isResettingDashboard ? 'Resetting...' : 'Reset'}
              </Button>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Palette className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
          </div>

          <div className="grid gap-3">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Sun className={`h-6 w-6 mb-2 ${theme === 'light' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${theme === 'light' ? 'text-blue-600' : 'text-gray-700'}`}>
                  Light
                </span>
              </button>

              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Moon className={`h-6 w-6 mb-2 ${theme === 'dark' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-600' : 'text-gray-700'}`}>
                  Dark
                </span>
              </button>

              <button
                onClick={() => handleThemeChange('system')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                  theme === 'system'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Monitor className={`h-6 w-6 mb-2 ${theme === 'system' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${theme === 'system' ? 'text-blue-600' : 'text-gray-700'}`}>
                  System
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Data */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Data</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Export Transactions</p>
                  <p className="text-sm text-gray-500">Download your data as CSV</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-red-900">Danger Zone</p>
                  <p className="text-sm text-red-700 mb-3">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sign Out */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form action={signout}>
            <Button
              type="submit"
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              Sign Out
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
