'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-6">
          We encountered an unexpected error. Please try again or return to the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
        {error.digest && (
          <p className="text-xs text-muted-foreground mt-6">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
