'use client';

import Link from 'next/link';
import type { Task } from '@/lib/types';

const statusConfig = {
  created:    { label: 'Created',    cls: 'bg-gray-100 text-gray-600' },
  queued:     { label: 'Queued',     cls: 'bg-yellow-100 text-yellow-700' },
  running:    { label: 'Running',    cls: 'bg-blue-100 text-blue-700' },
  completed:  { label: 'Completed',  cls: 'bg-green-100 text-green-700' },
  failed:     { label: 'Failed',     cls: 'bg-red-100 text-red-700' },
  terminated: { label: 'Terminated', cls: 'bg-orange-100 text-orange-700' },
  timed_out:  { label: 'Timed out',  cls: 'bg-orange-100 text-orange-700' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-gray-100 text-gray-500' },
};

export function TaskCard({ task }: { task: Task }) {
  const cfg = statusConfig[task.status] ?? statusConfig.created;
  const isActive = ['queued', 'running'].includes(task.status);

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{task.url}</p>
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">{task.prompt}</p>
        </div>
        <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 ${cfg.cls}`}>
          {isActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          )}
          {cfg.label}
        </span>
      </div>
      <p className="mt-3 text-xs text-gray-400">
        {new Date(task.created_at).toLocaleString()}
      </p>
    </Link>
  );
}
