'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAllUsers, getCoinHistory, awardCoinsManually, UserProfile, CoinTransaction } from '../../lib/firestore';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function CoinsPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [history, setHistory] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const load = async () => {
    const [u, h] = await Promise.all([getAllUsers(), getCoinHistory()]);
    setUsers(u.filter((x) => x.role !== 'admin'));
    setHistory(h);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !amount || !reason) return;
    const n = parseInt(amount);
    if (isNaN(n)) return;
    setSaving(true);
    try {
      await awardCoinsManually(selectedUserId, n, reason);
      setSuccess(`הוענקו ${n} מטבעות בהצלחה!`);
      setAmount('');
      setReason('');
      setTimeout(() => setSuccess(''), 3000);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const totalCoins = history.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  const formatDate = (ts: any) => {
    try {
      const d = ts?.toDate ? ts.toDate() : new Date(ts);
      return format(d, 'dd MMM, HH:mm', { locale: he });
    } catch { return ''; }
  };

  const getUserName = (userId: string) =>
    users.find((u) => u.id === userId)?.name || userId.slice(0, 8) + '...';

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">מטבעות</h1>
          <p className="text-gray-500 mt-1">ניהול וחלוקת מטבעות לתוכניות</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="card col-span-1">
            <h2 className="text-lg font-bold text-gray-900 mb-2">סה&quot;כ חולקו</h2>
            <p className="text-4xl font-bold text-amber-500">{totalCoins.toLocaleString()}</p>
            <p className="text-gray-400 text-sm mt-1">מטבעות 🪙</p>
          </div>
          <div className="card col-span-1">
            <h2 className="text-lg font-bold text-gray-900 mb-2">פעולות</h2>
            <p className="text-4xl font-bold text-primary-500">{history.length}</p>
            <p className="text-gray-400 text-sm mt-1">סה&quot;כ עסקאות</p>
          </div>
          <div className="card col-span-1">
            <h2 className="text-lg font-bold text-gray-900 mb-2">משתמשים</h2>
            <p className="text-4xl font-bold text-green-500">{users.length}</p>
            <p className="text-gray-400 text-sm mt-1">מתאמנים</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Award Form */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-6">הענק מטבעות ידנית</h2>
            <form onSubmit={handleAward} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">משתמש</label>
                <select
                  className="input"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="">בחר משתמש</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.coins} 🪙
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  כמות מטבעות
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="לדוגמה: 50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">סיבה</label>
                <input
                  className="input"
                  placeholder="לדוגמה: ביצועים יוצאי דופן"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                  {success}
                </div>
              )}

              <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center">
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'הענק מטבעות'
                )}
              </button>
            </form>
          </div>

          {/* History */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">היסטוריה</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))
              ) : history.length === 0 ? (
                <p className="text-gray-400 text-center py-8">אין פעולות</p>
              ) : (
                history.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                      tx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {tx.amount > 0 ? '↑' : '↓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{getUserName(tx.userId)}</p>
                      <p className="text-xs text-gray-400 truncate">{tx.reason}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount} 🪙
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
