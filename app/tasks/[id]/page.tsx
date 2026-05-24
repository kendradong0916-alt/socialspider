'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BrowserViewer } from '@/components/BrowserViewer';
import { TaskSteps } from '@/components/TaskSteps';
import type { Task } from '@/lib/types';

const ACTIVE = new Set(['queued', 'running', 'created']);
const POLL_MS = 3000;

const statusBadge: Record<string, string> = {
  created:    'bg-gray-100 text-gray-600',
  queued:     'bg-yellow-100 text-yellow-700',
  running:    'bg-blue-100 text-blue-700',
  completed:  'bg-green-100 text-green-700',
  failed:     'bg-red-100 text-red-700',
  terminated: 'bg-orange-100 text-orange-700',
  timed_out:  'bg-orange-100 text-orange-700',
  cancelled:  'bg-gray-100 text-gray-500',
};

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchTask = async () => {
      const res = await fetch(`/api/tasks/${id}`, { cache: 'no-store' });
      if (res.ok && mountedRef.current) {
        const data: Task = await res.json();
        setTask(data);
        setLoading(false);

        if (ACTIVE.has(data.status)) {
          timerRef.current = setTimeout(fetchTask, POLL_MS);
        }
      } else if (mountedRef.current) {
        setLoading(false);
      }
    };

    fetchTask();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id]);

  const cancelTask = async () => {
    if (!task) return;
    setCancelling(true);
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTask((t) => t ? { ...t, status: 'cancelled' } : t);
    setCancelling(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-3">Task not found.</p>
          <Link href="/tasks" className="text-blue-600 text-sm hover:underline">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isActive = ACTIVE.has(task.status);
  const badgeCls = statusBadge[task.status] ?? statusBadge.created;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/tasks" className="text-sm text-gray-500 hover:text-gray-700 flex-shrink-0">
              ← Dashboard
            </Link>
            <span className="text-gray-300">|</span>
            <p className="text-sm text-gray-700 truncate">{task.url}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 ${badgeCls}`}>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              )}
              {task.status}
            </span>
            {isActive && (
              <button
                onClick={cancelTask}
                disabled={cancelling}
                className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Task info bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">Task:</span> {task.prompt}
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid lg:grid-cols-3 gap-6">
        {/* Browser view — takes 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <BrowserViewer taskId={id} status={task.status} />
        </div>

        {/* Steps panel — takes 1/3 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Steps</h3>
            {isActive && (
              <span className="text-xs text-blue-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <TaskSteps taskId={id} taskStatus={task.status} />
        </div>
      </div>

      {/* Results section */}
      {task.status === 'completed' && (
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <div className="bg-white rounded-xl border border-green-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-green-500">✓</span> Extracted Results
            </h3>
            {task.result ? (
              <pre className="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 overflow-auto max-h-96 border border-gray-100">
                {JSON.stringify(task.result, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-gray-500">Task completed. Skyvern did not return structured output for this run.</p>
            )}
          </div>
        </div>
      )}

      {/* Failure info */}
      {(task.status === 'failed' || task.status === 'terminated') && task.failure_reason && (
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <div className="bg-red-50 rounded-xl border border-red-200 p-5">
            <h3 className="font-semibold text-red-800 mb-2">Failure Reason</h3>
            <p className="text-sm text-red-700">{task.failure_reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
