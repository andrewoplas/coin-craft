'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tags,
  Wallet2,
  Target,
  BarChart3,
  Settings,
  X,
  Menu,
} from 'lucide-react';
import { type ModuleRoute } from '@/modules/types';
import { useState } from 'react';

const iconMap = {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tags,
  Wallet2,
  Target,
  BarChart3,
  Settings,
};

type SidebarProps = {
  routes: ModuleRoute[];
  accentColor?: string;
};

export function Sidebar({ routes, accentColor = '#3B82F6' }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="text-xl font-bold text-gray-900">CoinCraft</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {routes.map((route) => {
            const Icon = iconMap[route.icon as keyof typeof iconMap] || LayoutDashboard;
            const isActive = pathname === route.path;

            return (
              <Link
                key={route.path}
                href={route.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: `${accentColor}15`,
                        color: accentColor,
                      }
                    : undefined
                }
              >
                <Icon size={20} />
                {!isCollapsed && <span>{route.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-gray-200">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <Settings size={20} />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
