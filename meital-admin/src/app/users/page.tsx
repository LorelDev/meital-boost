'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAllUsers, UserProfile, awardCoinsManually } from '../../lib/firestore';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [coinsAmount, setCoinsAmount] = useState('');
  const [coinsReason, setCoinsReason] = useState('');
  const [awardLoading, setAwardLoading] = useState(false);

  const load = async () => {
    const data = await getAllUsers();
    setUsers(data.filter((u) => u.role !== 'admin'));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  const formatDate = (ts: any) => {
    try {
      const d = ts?.toDate ? ts.toDate() : new Date(ts);
      return format(d, 'dd/MM/yyyy', { locale: he });
    } catch { return ''; }
  };

  const handleAward = async () => {
    if (!selectedUser || !coinsAmount || !coinsReason) return;
    const amount = parseInt(coinsAmount);
    if (isNaN(amount)) return;
    setAwardLoading(true);
    try {
      await awardCoinsManually(selectedUser.id, amount, coinsReason);
      await load();
      setSelectedUser(null);
      setCoinsAmount('');
      setCoinsReason('');
    } catch (e) {
      console.error(e);
    } finally {
      setAwardLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">משתמשים</h1>
            <p className="text-gray-500 mt-1">{users.length} משתמשים רשומים</p>
          </div>
        </div>

        {/* Search */}
        <div className="card mb-6">
          <input
            className="input"
            placeholder="חיפוש לפי שם, אימייל, או טלפון..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['משתמש', 'אימייל', 'טלפון', 'מטבעות', 'הצטרף', 'פעולות'].map((h) => (
                  <th key={h} className="text-right text-xs font-semibold text-gray-500 px-6 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    אין משתמשים
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-sm flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{user.phone}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{user.coins}</span>
                      <span className="text-sm mr-1">🪙</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="btn-secondary text-xs"
                      >
                        הענק מטבעות
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Award Coins Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-1">הענק מטבעות</h2>
              <p className="text-gray-500 mb-6">ל: {selectedUser.name}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    כמות מטבעות
                  </label>
                  <input
                    type="number"
                    className="input"
                    placeholder="לדוגמה: 50"
                    value={coinsAmount}
                    onChange={(e) => setCoinsAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    סיבה
                  </label>
                  <input
                    className="input"
                    placeholder="לדוגמה: ביצועים מצוינים"
                    value={coinsReason}
                    onChange={(e) => setCoinsReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAward}
                  disabled={awardLoading}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {awardLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'הענק'
                  )}
                </button>
                <button
                  onClick={() => { setSelectedUser(null); setCoinsAmount(''); setCoinsReason(''); }}
                  className="btn-secondary flex-1"
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
