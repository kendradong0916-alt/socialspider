'use client';

import { useEffect, useRef, useState } from 'react';
import type { SkyvernStep, TaskStatus } from '@/lib/types';

const ACTIVE = new Set<TaskStatus>(['queued', 'running']);
const POLL_MS = 3000;

const statusIcon: Record<SkyvernStep['status'], string> = {
  completed: '✓',
  running: '…',
  failed: '✗',
  created: '○',
  cancelled: '—',
};

const statusColor: Record<SkyvernStep['status'], string> = {
  completed: 'bg-green-500 text-white',
  running: 'bg-blue-500 text-white animate-pulse',
  failed: 'bg-red-500 text-white',
  created: 'bg-gray-200 text-gray-500',
  cancelled: 'bg-gray-300 text-gray-500',
};

interface Props {
  taskId: string;
  taskStatus: TaskStatus;
}

export function TaskSteps({ taskId, taskStatus }: Props) {
  const [steps, setSteps] = useState<SkyvernStep[]>([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchSteps = async () => {
      try {
        const res = await fetch(`/api/tasks/${taskId}/steps`, { cache: 'no-store' });
        if (res.ok && mountedRef.current) {
          const data: SkyvernStep[] = await res.json();
          setSteps(data);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    const schedule = () => {
      fetchSteps().finally(() => {
        if (mountedRef.current && ACTIVE.has(taskStatus)) {
          timerRef.current = setTimeout(schedule, POLL_MS);
        }
      });
    };

    schedule();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [taskId, taskStatus]);

  if (loading && steps.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="text-sm text-gray-400 text-center py-6">
        {ACTIVE.has(taskStatus) ? 'Waiting for first step…' : 'No steps recorded'}
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1">
      {steps.map((step) => {
        const action = step.actions_and_results?.[0]?.action;
        const label = action?.description ?? action?.action_type ?? `Step ${step.order + 1}`;

        return (
          <div
            key={step.step_id}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-white"
          >
            <span
              className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${statusColor[step.status]}`}
            >
              {statusIcon[step.status]}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Step {step.order + 1}{step.is_last ? ' · last' : ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
