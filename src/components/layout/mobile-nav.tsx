'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, Plus, BarChart3, Menu } from 'lucide-react';
import { useState } from 'react';
import { type ModuleRoute } from '@/modules/types';
import { useQuickAddStore } from '@/stores/quick-add-store';

type MobileNavProps = {
  routes: ModuleRoute[];
  accentColor?: string;
};

export function MobileNav({ routes, accentColor = '#3B82F6' }: MobileNavProps) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const openQuickAdd = useQuickAddStore((state) => state.open);

  // Primary routes for bottom nav
  const primaryRoutes = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transactions', icon: Receipt },
  ];

  // Find stats route if available
  const statsRoute = routes.find((r) => r.path === '/statistics');
  if (statsRoute) {
    primaryRoutes.push({
      path: statsRoute.path,
      label: statsRoute.label,
      icon: BarChart3,
    });
  }

  // All other routes go in "More"
  const moreRoutes = routes.filter(
    (r) => !primaryRoutes.some((pr) => pr.path === r.path)
  );

  return (
    <>
      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-4 py-2">
          {primaryRoutes.slice(0, 2).map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.path;

            return (
              <Link
                key={route.path}
                href={route.path}
                className="flex flex-col items-center gap-1 py-2 px-4"
                style={isActive ? { color: accentColor } : undefined}
              >
                <Icon size={24} />
                <span className="text-xs">{route.label}</span>
              </Link>
            );
          })}

          {/* Quick Add Button */}
          <button
            onClick={openQuickAdd}
            className="flex flex-col items-center gap-1 py-2 px-4 -mt-4"
            style={{ color: accentColor }}
            aria-label="Quick Add Transaction"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              <Plus size={28} className="text-white" />
            </div>
          </button>

          {primaryRoutes.slice(2).map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.path;

            return (
              <Link
                key={route.path}
                href={route.path}
                className="flex flex-col items-center gap-1 py-2 px-4"
                style={isActive ? { color: accentColor } : undefined}
              >
                <Icon size={24} />
                <span className="text-xs">{route.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setShowMore(true)}
            className="flex flex-col items-center gap-1 py-2 px-4"
          >
            <Menu size={24} />
            <span className="text-xs">More</span>
          </button>
        </div>
      </nav>

      {/* More drawer */}
      {showMore && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setShowMore(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">More</h3>
              <button
                onClick={() => setShowMore(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              {moreRoutes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  onClick={() => setShowMore(false)}
                  className="block px-4 py-3 hover:bg-gray-100 rounded-lg"
                >
                  {route.label}
                </Link>
              ))}
              <Link
                href="/settings"
                onClick={() => setShowMore(false)}
                className="block px-4 py-3 hover:bg-gray-100 rounded-lg"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
