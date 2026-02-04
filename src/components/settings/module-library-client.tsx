'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { toggleModule } from '@/server/actions/settings';
import { type ModuleManifest } from '@/modules/types';

type ModuleLibraryClientProps = {
  allModules: ModuleManifest[];
  moduleStatusMap: Record<string, boolean>;
};

export function ModuleLibraryClient({
  allModules,
  moduleStatusMap,
}: ModuleLibraryClientProps) {
  const router = useRouter();
  const [localStatusMap, setLocalStatusMap] = useState(moduleStatusMap);
  const [pendingToggle, setPendingToggle] = useState<{
    moduleId: string;
    newStatus: boolean;
  } | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleClick = (moduleId: string, currentStatus: boolean) => {
    // Core modules cannot be toggled
    if (moduleId === 'core' || moduleId === 'statistics') {
      toast.error('Core modules cannot be disabled');
      return;
    }

    const newStatus = !currentStatus;
    setPendingToggle({ moduleId, newStatus });
  };

  const handleConfirmToggle = async () => {
    if (!pendingToggle) return;

    setIsToggling(true);
    try {
      const result = await toggleModule(pendingToggle.moduleId, pendingToggle.newStatus);

      if (result.success) {
        setLocalStatusMap((prev) => ({
          ...prev,
          [pendingToggle.moduleId]: pendingToggle.newStatus,
        }));
        toast.success(
          pendingToggle.newStatus
            ? `${pendingToggle.moduleId} module enabled`
            : `${pendingToggle.moduleId} module disabled`
        );
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to toggle module');
      }
    } catch {
      toast.error('Failed to toggle module');
    } finally {
      setIsToggling(false);
      setPendingToggle(null);
    }
  };

  const pendingModule = pendingToggle
    ? allModules.find((m) => m.id === pendingToggle.moduleId)
    : null;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Module Library</h1>
            <p className="text-gray-500">
              Enable or disable modules to customize your experience
            </p>
          </div>
        </div>

        {/* Core Modules (Always On) */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Core Modules</h2>
          <p className="text-sm text-gray-500 mb-4">
            These modules are always enabled and provide essential functionality.
          </p>

          <div className="space-y-3">
            {allModules
              .filter((m) => m.id === 'core' || m.id === 'statistics')
              .map((module) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{module.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{module.name}</h3>
                      <p className="text-sm text-gray-500">{module.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm">Always on</span>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Optional Modules */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Optional Modules</h2>
          <p className="text-sm text-gray-500 mb-4">
            Enable these modules based on your needs. You can change this anytime.
          </p>

          <div className="space-y-3">
            {allModules
              .filter((m) => m.id !== 'core' && m.id !== 'statistics')
              .map((module) => {
                const isActive = localStatusMap[module.id] ?? false;

                return (
                  <div
                    key={module.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                      isActive
                        ? 'bg-white border-gray-200'
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{module.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{module.name}</h3>
                        <p className="text-sm text-gray-500">{module.description}</p>
                        {module.characterId && (
                          <p className="text-xs text-gray-400 mt-1">
                            Part of {module.characterId} character
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isActive ? (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          Active
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                          <X className="h-4 w-4" />
                          Disabled
                        </span>
                      )}
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => handleToggleClick(module.id, isActive)}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Features Summary */}
        <section className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
          <h3 className="font-medium text-blue-900 mb-2">What modules provide</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              <strong>Routes:</strong> New pages in the sidebar navigation
            </li>
            <li>
              <strong>Dashboard Widgets:</strong> Cards you can add to your dashboard
            </li>
            <li>
              <strong>Form Extensions:</strong> Extra fields in Quick Add transaction form
            </li>
          </ul>
        </section>

        {/* Confirmation Dialog */}
        <AlertDialog open={!!pendingToggle} onOpenChange={() => setPendingToggle(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-3">
                <span className="text-3xl">{pendingModule?.icon}</span>
                {pendingToggle?.newStatus ? 'Enable' : 'Disable'} {pendingModule?.name}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingToggle?.newStatus ? (
                  <p>
                    This will add {pendingModule?.name} to your navigation and make its
                    features available.
                  </p>
                ) : (
                  <p>
                    Disabling this module will hide it from your navigation and dashboard.
                    Your data will be preserved.
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isToggling}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmToggle}
                disabled={isToggling}
                className={pendingToggle?.newStatus ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {isToggling
                  ? 'Processing...'
                  : pendingToggle?.newStatus
                  ? 'Enable Module'
                  : 'Disable Module'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
