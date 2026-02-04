'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`bg-card rounded-lg border p-12 ${className}`}>
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="text-6xl md:text-8xl mb-6">{icon}</div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">{title}</h2>
        <p className="text-muted-foreground mb-8">{description}</p>
        {action && (
          action.href ? (
            <Button asChild size="lg">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick} size="lg">
              {action.label}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

// Compact version for widgets
type CompactEmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
};

export function CompactEmptyState({
  icon,
  title,
  description,
  action,
}: CompactEmptyStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-4">
      <div className="text-muted-foreground mb-2">{icon}</div>
      <p className="text-sm text-muted-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="text-sm text-primary hover:underline mt-1"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="text-sm text-primary hover:underline mt-1"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
