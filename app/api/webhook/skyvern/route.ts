import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// Skyvern calls this when a run finishes
export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Skyvern sends run_id (new API) or task_id (legacy)
  const runId = (payload.run_id ?? payload.task_id) as string | undefined;
  const status = payload.status as string | undefined;

  if (!runId || !status) {
    return NextResponse.json({ error: 'Missing run_id/status' }, { status: 400 });
  }

  const db = createServerClient();
  await db
    .from('tasks')
    .update({
      status,
      result: (payload.output ?? payload.extracted_information ?? null) as object | null,
      failure_reason: (payload.failure_reason ?? null) as string | null,
      updated_at: new Date().toISOString(),
    })
    .eq('skyvern_task_id', runId);

  return NextResponse.json({ ok: true });
}
