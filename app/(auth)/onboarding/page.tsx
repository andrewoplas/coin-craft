'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CHARACTERS } from '@/lib/constants';
import { CharacterCard } from '@/components/onboarding/character-card';

export default function CharacterSelectPage() {
  const router = useRouter();

  const handleCharacterSelect = (characterId: string) => {
    // Store selected character in sessionStorage to pass to setup
    sessionStorage.setItem('selectedCharacter', characterId);
    router.push('/onboarding/setup');
  };

  const characters = Object.values(CHARACTERS);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to CoinCraft ✨
          </h1>
          <p className="text-xl text-gray-600">
            How do you want to manage your money?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onSelect={handleCharacterSelect}
            />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/onboarding/quiz"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors shadow-md"
          >
            🤔 Help me choose
          </Link>
        </div>
      </div>
    </div>
  );
}
