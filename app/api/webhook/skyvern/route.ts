import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// Skyvern calls this URL when a task finishes (set via webhook_callback_url)
export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { task_id, status, extracted_information, failure_reason } = payload as {
    task_id?: string;
    status?: string;
    extracted_information?: Record<string, unknown>;
    failure_reason?: string;
  };

  if (!task_id || !status) {
    return NextResponse.json({ error: 'Missing task_id or status' }, { status: 400 });
  }

  const db = createServerClient();
  await db
    .from('tasks')
    .update({
      status,
      result: extracted_information ?? null,
      failure_reason: failure_reason ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('skyvern_task_id', task_id);

  return NextResponse.json({ ok: true });
}
