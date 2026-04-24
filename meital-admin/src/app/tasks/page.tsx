'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAllTasks, createTask, updateTask, deleteTask, Task } from '../../lib/firestore';

const emptyForm = { title: '', description: '', reward: 20, category: '', active: true };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await getAllTasks();
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description,
      reward: task.reward,
      category: task.category || '',
      active: task.active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateTask(editing.id, form);
      } else {
        await createTask(form);
      }
      await load();
      setShowModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (task: Task) => {
    await updateTask(task.id, { active: !task.active });
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את המשימה?')) return;
    await deleteTask(id);
    await load();
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">משימות</h1>
            <p className="text-gray-500 mt-1">{tasks.filter((t) => t.active).length} פעילות</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <span>+</span> משימה חדשה
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="card h-24 animate-pulse bg-gray-100" />
            ))
          ) : tasks.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <p>אין משימות עדיין</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="card flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{task.title}</h3>
                    {task.category && (
                      <span className="badge bg-primary-50 text-primary-600">{task.category}</span>
                    )}
                    <span className={`badge ${task.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {task.active ? 'פעיל' : 'מושבת'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{task.description}</p>
                  <p className="text-sm font-bold text-amber-500 mt-2">פרס: +{task.reward} 🪙</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(task)}
                    className={task.active ? 'btn-secondary text-xs' : 'btn-primary text-xs'}
                  >
                    {task.active ? 'השבת' : 'הפעל'}
                  </button>
                  <button onClick={() => openEdit(task)} className="btn-secondary text-xs">
                    עריכה
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="btn-danger text-xs">
                    מחק
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editing ? 'עריכת משימה' : 'משימה חדשה'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">כותרת</label>
                  <input
                    className="input"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="שם המשימה"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">תיאור</label>
                  <textarea
                    className="input resize-none"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="תיאור מפורט של המשימה..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">פרס (מטבעות)</label>
                    <input
                      type="number"
                      className="input"
                      value={form.reward}
                      onChange={(e) => setForm({ ...form, reward: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">קטגוריה</label>
                    <input
                      className="input"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="למידה, כושר, צוות..."
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    משימה פעילה
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    editing ? 'עדכן' : 'צור'
                  )}
                </button>
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
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
