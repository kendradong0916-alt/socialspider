import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { skyvern } from '@/lib/skyvern';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = createServerClient();
  const { data: task, error } = await db
    .from('tasks')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !task) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (task.skyvern_task_id && ['queued', 'running'].includes(task.status)) {
    try {
      const live = await skyvern.getTask(task.skyvern_task_id);
      if (live.status !== task.status) {
        const { data: updated } = await db
          .from('tasks')
          .update({
            status: live.status,
            result: live.output ?? null,
            failure_reason: live.failure_reason ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', task.id)
          .select()
          .single();

        return NextResponse.json(updated ?? task);
      }
    } catch {
      // Return cached state if Skyvern unreachable
    }
  }

  return NextResponse.json(task);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = createServerClient();
  const { data: task } = await db
    .from('tasks')
    .select('skyvern_task_id, status')
    .eq('id', params.id)
    .single();

  if (task?.skyvern_task_id && ['queued', 'running'].includes(task.status)) {
    await skyvern.cancelTask(task.skyvern_task_id).catch(() => {});
  }

  await db.from('tasks').update({ status: 'cancelled' }).eq('id', params.id);
  return NextResponse.json({ ok: true });
}
