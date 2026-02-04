'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Critical Error
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Something went seriously wrong. Please refresh the page or contact support.
            </p>
            <Button onClick={() => reset()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
            {error.digest && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-6">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
