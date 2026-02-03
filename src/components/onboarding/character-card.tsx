'use client';

import { type CharacterConfig } from '@/lib/constants';
import { useState } from 'react';

type CharacterCardProps = {
  character: CharacterConfig;
  onSelect: (id: string) => void;
};

export function CharacterCard({ character, onSelect }: CharacterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (!character.available) return;
    if (isExpanded) {
      onSelect(character.id);
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => character.available && setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      disabled={!character.available}
      className={`
        relative p-6 rounded-2xl border-2 transition-all text-left
        ${character.available
          ? 'hover:scale-105 hover:shadow-xl cursor-pointer border-gray-200 hover:border-blue-500'
          : 'opacity-50 cursor-not-allowed border-gray-200'
        }
        ${isExpanded && character.available ? 'ring-2 ring-blue-500 scale-105 shadow-xl' : ''}
        bg-white
      `}
      style={
        character.available && isExpanded
          ? { borderColor: character.accentColor }
          : undefined
      }
    >
      {!character.available && (
        <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
          Coming Soon
        </div>
      )}

      <div className="text-center mb-4">
        <div className="text-6xl mb-2">{character.icon}</div>
        <h3 className="text-xl font-bold text-gray-900">{character.name}</h3>
      </div>

      <p className="text-sm font-medium text-gray-700 mb-2">{character.tagline}</p>

      {isExpanded && character.available && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">{character.description}</p>
          <div className="text-xs text-gray-500">
            <span className="font-medium">Includes:</span> {character.modules.join(', ')}
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium" style={{ color: character.accentColor }}>
              Click to select →
            </span>
          </div>
        </div>
      )}
    </button>
  );
}
