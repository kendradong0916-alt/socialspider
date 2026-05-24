'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { TaskStatus } from '@/lib/types';

const ACTIVE = new Set<TaskStatus>(['queued', 'running']);
const POLL_MS = 2000;

interface Props {
  taskId: string;
  status: TaskStatus;
}

export function BrowserViewer({ taskId, status }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [error, setError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const fetchFrame = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/screenshot`, { cache: 'no-store' });
      if (!mountedRef.current) return;

      if (res.status === 204 || !res.ok) {
        // No screenshot yet — retry
        return;
      }

      const blob = await res.blob();
      if (!mountedRef.current) return;

      const url = URL.createObjectURL(blob);
      setSrc((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setFrameCount((n) => n + 1);
      setError(false);
    } catch {
      if (mountedRef.current) setError(true);
    }
  }, [taskId]);

  useEffect(() => {
    mountedRef.current = true;
    if (!ACTIVE.has(status)) return;

    const schedule = () => {
      fetchFrame().finally(() => {
        if (mountedRef.current && ACTIVE.has(status)) {
          timerRef.current = setTimeout(schedule, POLL_MS);
        }
      });
    };

    schedule();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchFrame, status]);

  const isActive = ACTIVE.has(status);

  return (
    <div className="flex flex-col h-full">
      {/* Chrome-style header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 border-b border-gray-200">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-500 border border-gray-200 truncate">
          Skyvern Browser — Live View
        </div>
        <div className="text-xs text-gray-400 whitespace-nowrap">
          {isActive && (
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live · {frameCount} frames
            </span>
          )}
          {status === 'completed' && '✓ Done'}
          {status === 'failed' && '✗ Failed'}
          {status === 'cancelled' && '— Cancelled'}
        </div>
      </div>

      {/* Viewport */}
      <div className="relative flex-1 bg-zinc-900 min-h-0 flex items-center justify-center aspect-video">
        {src ? (
          <img
            src={src}
            alt="Live browser screenshot"
            className="w-full h-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            {isActive ? (
              <>
                <svg className="w-10 h-10 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <p className="text-sm">Waiting for browser session…</p>
              </>
            ) : status === 'created' ? (
              <p className="text-sm">Task queued, starting soon…</p>
            ) : (
              <p className="text-sm text-gray-500">No screenshot available</p>
            )}
          </div>
        )}

        {error && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1.5 rounded">
            Screenshot unavailable
          </div>
        )}
      </div>
    </div>
  );
}
