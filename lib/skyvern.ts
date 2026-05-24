import type { SkyvernTask, SkyvernStep } from './types';

// Normalise: always end with /api/v1 regardless of what the env var contains
function normaliseBase(url: string): string {
  const trimmed = url.replace(/\/+$/, '');
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
}
const BASE_URL = normaliseBase(process.env.SKYVERN_API_URL || 'https://api.skyvern.com');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = process.env.SKYVERN_API_KEY;
  if (!apiKey) throw new Error('SKYVERN_API_KEY is not configured');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Skyvern ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export interface CreateTaskInput {
  url: string;
  prompt: string;
  webhookUrl?: string;
  maxSteps?: number;
}

export const skyvern = {
  createTask(input: CreateTaskInput): Promise<SkyvernTask> {
    return request<SkyvernTask>('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        url: input.url,
        navigation_goal: input.prompt,
        data_extraction_goal: input.prompt,
        webhook_callback_url: input.webhookUrl ?? null,
        max_steps_per_run: input.maxSteps ?? 25,
      }),
    });
  },

  getTask(taskId: string): Promise<SkyvernTask> {
    return request<SkyvernTask>(`/tasks/${taskId}`);
  },

  getSteps(taskId: string): Promise<SkyvernStep[]> {
    return request<SkyvernStep[]>(`/tasks/${taskId}/steps`);
  },

  cancelTask(taskId: string): Promise<void> {
    return request<void>(`/tasks/${taskId}/cancel`, { method: 'POST' });
  },

  async getStepScreenshot(taskId: string, stepId: string): Promise<Response> {
    const apiKey = process.env.SKYVERN_API_KEY;
    if (!apiKey) throw new Error('SKYVERN_API_KEY is not configured');
    return fetch(`${BASE_URL}/tasks/${taskId}/steps/${stepId}/screenshot`, {
      headers: { 'x-api-key': apiKey },
    });
  },
};
