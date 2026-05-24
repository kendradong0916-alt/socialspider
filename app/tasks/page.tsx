'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CreateTaskForm } from '@/components/CreateTaskForm';
import { TaskCard } from '@/components/TaskCard';
import type { Task } from '@/lib/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const failCountRef = useRef(0);

  const refresh = async () => {
    try {
      const res = await fetch('/api/tasks', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data) {
          setTasks(data);
          setFetchError(null);
          failCountRef.current = 0;
        }
      } else {
        failCountRef.current += 1;
        if (failCountRef.current === 1) {
          setFetchError(`API returned ${res.status} — check environment variables in Vercel`);
        }
      }
    } catch {
      failCountRef.current += 1;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // Stop polling after 3 consecutive failures to avoid log spam
    const interval = setInterval(() => {
      if (failCountRef.current < 3) refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
            <h2 className="font-semibold text-gray-900 mb-4">New Task</h2>
            <CreateTaskForm />
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Tasks</h2>
            <button
              onClick={() => { failCountRef.current = 0; refresh(); }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Refresh
            </button>
          </div>

          {fetchError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <p className="font-medium">Configuration error</p>
              <p className="mt-1 text-xs">{fetchError}</p>
              <p className="mt-2 text-xs font-medium">Required Vercel env vars:</p>
              <ul className="mt-1 text-xs space-y-0.5 ml-3 list-disc">
                <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
                <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
                <li><code>SUPABASE_SERVICE_ROLE_KEY</code> (not SERVICE_KEY)</li>
                <li><code>SKYVERN_API_KEY</code></li>
                <li><code>NEXT_PUBLIC_APP_URL</code></li>
              </ul>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : tasks.length === 0 && !fetchError ? (
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
