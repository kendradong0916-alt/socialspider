import type { SkyvernStep } from './types';

// Base URL — strip trailing slash, never append /api/v1 (new API is at /v1/run/*)
const BASE_URL = (process.env.SKYVERN_API_URL || 'https://api.skyvern.com').replace(/\/+$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = process.env.SKYVERN_API_KEY;
  if (!apiKey) throw new Error('SKYVERN_API_KEY is not configured');

  const fullUrl = `${BASE_URL}${path}`;
  const res = await fetch(fullUrl, {
    ...init,
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Skyvern ${res.status} [${fullUrl}]: ${body}`);
  }

  return res.json() as Promise<T>;
}

export interface SkyvernTaskRun {
  run_id: string;
  status: string;
  output: Record<string, unknown> | null;
  screenshot_urls: string[] | null;
  recording_url: string | null;
  failure_reason: string | null;
  step_count: number | null;
  created_at: string;
  modified_at: string;
}

export interface SkyvernTimelineEntry {
  type: string;
  step?: SkyvernStep;
  description?: string;
  screenshot_url?: string;
  timestamp?: string;
}

export interface CreateTaskInput {
  url: string;
  prompt: string;
  webhookUrl?: string;
  maxSteps?: number;
}

export const skyvern = {
  createTask(input: CreateTaskInput): Promise<SkyvernTaskRun> {
    return request<SkyvernTaskRun>('/v1/run/tasks', {
      method: 'POST',
      body: JSON.stringify({
        url: input.url,
        prompt: input.prompt,
        webhook_url: input.webhookUrl ?? null,
        max_steps: input.maxSteps ?? 25,
        engine: 'skyvern-2.0',
      }),
    });
  },

  getTask(runId: string): Promise<SkyvernTaskRun> {
    return request<SkyvernTaskRun>(`/v1/run/tasks/${runId}`);
  },

  getSteps(runId: string): Promise<SkyvernStep[]> {
    // Try timeline endpoint first, fall back to steps
    return request<unknown>(`/v1/run/${runId}/timeline`)
      .then((data) => {
        if (Array.isArray(data)) return data as SkyvernStep[];
        if (data && typeof data === 'object') {
          const d = data as Record<string, unknown>;
          if (Array.isArray(d.items)) return d.items as SkyvernStep[];
          if (Array.isArray(d.steps)) return d.steps as SkyvernStep[];
          if (Array.isArray(d.timeline)) return d.timeline as SkyvernStep[];
        }
        return [];
      })
      .catch(() => []);
  },

  cancelTask(runId: string): Promise<void> {
    return request<void>(`/v1/run/${runId}/cancel`, { method: 'POST' });
  },
};
