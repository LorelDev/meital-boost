'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAllUsers, getAllUserTasks, getAllTasks, approveUserTask, UserTask, UserProfile, Task } from '../../lib/firestore';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

type EnrichedUserTask = UserTask & {
  userName?: string;
  taskTitle?: string;
  taskReward?: number;
};

const statusLabels: Record<string, string> = {
  pending: 'ממתין',
  in_progress: 'בתהליך',
  completed: 'הושלם (מטבעות הוענקו)',
  approved: 'אושר ✓',
};

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-50 text-blue-600',
  completed: 'bg-yellow-50 text-yellow-700',
  approved: 'bg-green-50 text-green-600',
};

export default function ActivityPage() {
  const [items, setItems] = useState<EnrichedUserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [approving, setApproving] = useState<string | null>(null);

  const load = async () => {
    const [userTasks, users, tasks] = await Promise.all([
      getAllUserTasks(),
      getAllUsers(),
      getAllTasks(),
    ]);

    const usersMap: Record<string, UserProfile> = {};
    users.forEach((u) => { usersMap[u.id] = u; });

    const tasksMap: Record<string, Task> = {};
    tasks.forEach((t) => { tasksMap[t.id] = t; });

    const enriched: EnrichedUserTask[] = userTasks.map((ut) => ({
      ...ut,
      userName: usersMap[ut.userId]?.name || 'משתמש לא ידוע',
      taskTitle: tasksMap[ut.taskId]?.title || 'משימה לא ידועה',
      taskReward: tasksMap[ut.taskId]?.reward || 0,
    }));

    // Sort: completed first, then by date
    enriched.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return -1;
      if (b.status === 'completed' && a.status !== 'completed') return 1;
      return 0;
    });

    setItems(enriched);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (ut: EnrichedUserTask) => {
    setApproving(ut.id);
    try {
      await approveUserTask(ut.id, ut.userId, ut.taskReward || 0, ut.taskTitle || '');
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setApproving(null);
    }
  };

  const formatDate = (ts: any) => {
    try {
      const d = ts?.toDate ? ts.toDate() : new Date(ts);
      return format(d, 'dd/MM HH:mm', { locale: he });
    } catch { return ''; }
  };

  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter);

  const pendingApproval = items.filter((i) => i.status === 'completed').length;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">פעילות משתמשים</h1>
            <p className="text-gray-500 mt-1">
              {pendingApproval > 0 && (
                <span className="text-yellow-600 font-semibold">{pendingApproval} ממתינים לאישור · </span>
              )}
              {items.length} פעולות סה&quot;כ
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'הכל' },
            { key: 'completed', label: 'הושלמו' },
            { key: 'in_progress', label: 'בתהליך' },
            { key: 'approved', label: 'אושרו' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {f.label}
              {f.key === 'completed' && pendingApproval > 0 && (
                <span className="mr-2 bg-yellow-400 text-white text-xs rounded-full px-1.5 py-0.5">
                  {pendingApproval}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['משתמש', 'משימה', 'פרס', 'סטטוס', 'תאריך', 'פעולות'].map((h) => (
                  <th key={h} className="text-right text-xs font-semibold text-gray-500 px-6 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(6)].map((_, i) => (
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
                    אין פעילות
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.status === 'completed' ? 'bg-yellow-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-sm">
                          {item.userName?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{item.taskTitle}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-amber-500">+{item.taskReward} 🪙</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${statusColors[item.status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabels[item.status] || item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {formatDate(item.completedAt || item.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'completed' && (
                        <button
                          onClick={() => handleApprove(item)}
                          disabled={approving === item.id}
                          className="btn-primary text-xs flex items-center gap-1"
                        >
                          {approving === item.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            'סמן כאושר ✓'
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
