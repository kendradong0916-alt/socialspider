export type TaskStatus =
  | 'created'
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'terminated'
  | 'timed_out'
  | 'cancelled';

export interface Task {
  id: string;
  skyvern_task_id: string | null;
  url: string;
  prompt: string;
  status: TaskStatus;
  result: Record<string, unknown> | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkyvernTask {
  run_id: string;
  status: TaskStatus;
  output: Record<string, unknown> | null;
  screenshot_urls: string[] | null;
  recording_url: string | null;
  failure_reason: string | null;
  step_count: number | null;
  created_at: string;
  modified_at: string;
}

export interface SkyvernActionResult {
  action_type: string;
  description?: string;
  element_id?: string;
  text?: string;
}

export interface SkyvernStep {
  step_id: string;
  task_id: string;
  order: number;
  is_last: boolean;
  status: 'created' | 'running' | 'failed' | 'completed' | 'cancelled';
  actions_and_results: Array<{
    action: SkyvernActionResult;
    result: unknown;
  }>;
  output: Record<string, unknown> | null;
  screenshot_url: string | null;
  created_at: string;
  modified_at: string;
}
