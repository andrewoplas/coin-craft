'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Nudge } from '@/server/queries/nudges';
import { useQuickAddStore } from '@/stores/quick-add-store';

type NudgeBannerProps = {
  nudges: Nudge[];
};

const typeStyles = {
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300',
  warning: 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300',
  success: 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300',
  celebration: 'bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300',
};

export function NudgeBanner({ nudges }: NudgeBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const openQuickAdd = useQuickAddStore((state) => state.open);

  // Filter out dismissed nudges
  const visibleNudges = nudges.filter((n) => !dismissed.includes(n.id));

  if (visibleNudges.length === 0) {
    return null;
  }

  const currentNudge = visibleNudges[currentIndex % visibleNudges.length];

  const handleDismiss = () => {
    setDismissed([...dismissed, currentNudge.id]);
    if (currentIndex >= visibleNudges.length - 1) {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : visibleNudges.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % visibleNudges.length);
  };

  const handleAction = (href: string) => {
    if (href === '#quick-add') {
      openQuickAdd();
    }
  };

  return (
    <div
      className={`rounded-lg border p-4 mb-6 ${typeStyles[currentNudge.type]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{currentNudge.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{currentNudge.title}</h3>
          <p className="text-sm opacity-80">{currentNudge.description}</p>
          {currentNudge.action && (
            currentNudge.action.href === '#quick-add' ? (
              <Button
                variant="link"
                size="sm"
                className="px-0 h-auto text-sm font-medium mt-1"
                onClick={() => handleAction(currentNudge.action!.href)}
              >
                {currentNudge.action.label} →
              </Button>
            ) : (
              <Link
                href={currentNudge.action.href}
                className="inline-block text-sm font-medium mt-1 hover:underline"
              >
                {currentNudge.action.label} →
              </Link>
            )
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {visibleNudges.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs opacity-60">
                {currentIndex + 1}/{visibleNudges.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
