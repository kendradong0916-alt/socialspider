'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreateTaskForm } from '@/components/CreateTaskForm';
import { TaskCard } from '@/components/TaskCard';
import type { Task } from '@/lib/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const res = await fetch('/api/tasks', { cache: 'no-store' });
    if (res.ok) setTasks(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Home
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-semibold text-gray-900">Task Dashboard</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-5 gap-8">
        {/* Create form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
            <h2 className="font-semibold text-gray-900 mb-4">New Task</h2>
            <CreateTaskForm />
          </div>
        </div>

        {/* Task list */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Tasks</h2>
            <button
              onClick={refresh}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              No tasks yet. Create your first one →
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
