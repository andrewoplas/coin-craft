import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Page not found
        </h1>
        <p className="text-muted-foreground mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/transactions">
              <Search className="w-4 h-4 mr-2" />
              View Transactions
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
