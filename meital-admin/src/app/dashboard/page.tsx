'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getDashboardStats, getAllUsers, getAllUserTasks, getCoinHistory } from '../../lib/firestore';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface Stats {
  totalUsers: number;
  activeTasks: number;
  completedTasks: number;
  totalCoinsAwarded: number;
}

const statCards = (stats: Stats) => [
  { label: 'משתמשים רשומים', value: stats.totalUsers, icon: '👥', color: 'bg-blue-50 text-blue-600', change: '+' },
  { label: 'משימות פעילות', value: stats.activeTasks, icon: '✅', color: 'bg-green-50 text-green-600', change: '' },
  { label: 'משימות הושלמו', value: stats.completedTasks, icon: '🏆', color: 'bg-yellow-50 text-yellow-600', change: '+' },
  { label: 'מטבעות חולקו', value: stats.totalCoinsAwarded, icon: '🪙', color: 'bg-purple-50 text-purple-600', change: '+' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, activeTasks: 0, completedTasks: 0, totalCoinsAwarded: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, users, coins] = await Promise.all([
        getDashboardStats(),
        getAllUsers(),
        getCoinHistory(),
      ]);
      setStats(s);
      setTopUsers(
        users
          .filter((u) => u.role !== 'admin')
          .sort((a, b) => b.coins - a.coins)
          .slice(0, 5)
      );
      setRecentActivity(coins.slice(0, 10));
      setLoading(false);
    };
    load();
  }, []);

  const formatDate = (ts: any) => {
    try {
      const d = ts?.toDate ? ts.toDate() : new Date(ts);
      return format(d, 'dd MMM HH:mm', { locale: he });
    } catch { return ''; }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">לוח בקרה</h1>
          <p className="text-gray-500 mt-1">סקירה כללית של פעילות התוכנית</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {statCards(stats).map((card) => (
            <div key={card.label} className="card">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{card.icon}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.color}`}>
                  {card.label}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{loading ? '—' : card.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Top Users */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">מובילי לוח</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : topUsers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">אין משתמשים עדיין</p>
            ) : (
              <div className="space-y-3">
                {topUsers.map((user, idx) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-300 w-6">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-sm">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-900">{user.coins}</span>
                      <span>🪙</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">פעילות אחרונה</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">אין פעילות עדיין</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {recentActivity.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 py-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      tx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {tx.amount > 0 ? '↑' : '↓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{tx.reason}</p>
                      <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                    </div>
                    <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
