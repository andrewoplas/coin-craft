'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { changeCharacter } from '@/server/actions/settings';
import { type CharacterConfig } from '@/lib/constants';

type CharacterChangeClientProps = {
  currentCharacterId: string | null;
  availableCharacters: CharacterConfig[];
};

export function CharacterChangeClient({
  currentCharacterId,
  availableCharacters,
}: CharacterChangeClientProps) {
  const router = useRouter();
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [resetDashboard, setResetDashboard] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const selectedCharacter = selectedCharacterId
    ? availableCharacters.find((c) => c.id === selectedCharacterId)
    : null;

  const handleCharacterSelect = (characterId: string) => {
    if (characterId === currentCharacterId) {
      return; // Already selected
    }
    setSelectedCharacterId(characterId);
    setShowConfirmDialog(true);
  };

  const handleConfirmChange = async () => {
    if (!selectedCharacterId) return;

    setIsChanging(true);
    try {
      const result = await changeCharacter(selectedCharacterId, resetDashboard);

      if (result.success) {
        toast.success('Character changed successfully!');
        router.push('/settings');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to change character');
      }
    } catch {
      toast.error('Failed to change character');
    } finally {
      setIsChanging(false);
      setShowConfirmDialog(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Change Character</h1>
            <p className="text-gray-500">
              Choose a different financial character to change your experience
            </p>
          </div>
        </div>

        {/* Character Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableCharacters.map((character) => {
            const isCurrentCharacter = character.id === currentCharacterId;

            return (
              <button
                key={character.id}
                onClick={() => handleCharacterSelect(character.id)}
                className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                  isCurrentCharacter
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                }`}
                style={
                  isCurrentCharacter
                    ? { borderColor: character.accentColor }
                    : undefined
                }
              >
                {isCurrentCharacter && (
                  <div
                    className="absolute top-3 right-3 p-1 rounded-full text-white"
                    style={{ backgroundColor: character.accentColor }}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                )}

                <div className="text-4xl mb-3">{character.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{character.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{character.tagline}</p>
                <p className="text-xs text-gray-400">{character.description}</p>

                {isCurrentCharacter && (
                  <div
                    className="mt-4 px-3 py-1 rounded-full text-xs font-medium inline-block"
                    style={{
                      backgroundColor: `${character.accentColor}20`,
                      color: character.accentColor,
                    }}
                  >
                    Current Character
                  </div>
                )}

                {/* Modules preview */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Modules included:</p>
                  <div className="flex flex-wrap gap-1">
                    {character.modules.map((moduleId) => (
                      <span
                        key={moduleId}
                        className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600 capitalize"
                      >
                        {moduleId}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-3">
                <span className="text-3xl">{selectedCharacter?.icon}</span>
                Switch to {selectedCharacter?.name}?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  Changing your character will update your active modules. This is your
                  new origin story!
                </p>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="reset-dashboard" className="text-sm text-gray-700">
                      Reset dashboard to default
                    </Label>
                  </div>
                  <Switch
                    id="reset-dashboard"
                    checked={resetDashboard}
                    onCheckedChange={setResetDashboard}
                  />
                </div>

                {resetDashboard && (
                  <p className="text-xs text-amber-600">
                    Your dashboard widgets will be reset to the default layout for{' '}
                    {selectedCharacter?.name}.
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isChanging}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmChange}
                disabled={isChanging}
                style={{ backgroundColor: selectedCharacter?.accentColor }}
              >
                {isChanging ? 'Changing...' : 'Confirm Change'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
