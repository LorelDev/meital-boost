'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '../lib/auth-context';

const navItems = [
  { href: '/dashboard', label: 'לוח בקרה', icon: '📊' },
  { href: '/users', label: 'משתמשים', icon: '👥' },
  { href: '/tasks', label: 'משימות', icon: '✅' },
  { href: '/coins', label: 'מטבעות', icon: '🪙' },
  { href: '/activity', label: 'פעילות', icon: '📋' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, profile, loading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-100 shadow-sm flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-xl">
              🌟
            </div>
            <div>
              <p className="font-bold text-gray-900">מיטל</p>
              <p className="text-xs text-gray-400">פאנל ניהול</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600">
              {profile?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400 truncate">{profile?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.replace('/login'); }}
            className="w-full text-right text-sm text-red-500 hover:text-red-700 py-1 transition-colors"
          >
            התנתק
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 mr-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
