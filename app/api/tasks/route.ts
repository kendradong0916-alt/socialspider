import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { skyvern } from '@/lib/skyvern';

export async function GET() {
  const db = createServerClient();
  const { data, error } = await db
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { url, prompt } = body as { url?: string; prompt?: string };

  if (!url || !prompt) {
    return NextResponse.json({ error: 'url and prompt are required' }, { status: 400 });
  }

  const db = createServerClient();

  // Persist to Supabase first so we have an id even if Skyvern fails
  const { data: row, error: insertErr } = await db
    .from('tasks')
    .insert({ url, prompt, status: 'created' })
    .select()
    .single();

  if (insertErr || !row) {
    return NextResponse.json({ error: insertErr?.message ?? 'DB insert failed' }, { status: 500 });
  }

  // Create task in Skyvern
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const skyvernTask = await skyvern.createTask({
      url,
      prompt,
      webhookUrl: appUrl ? `${appUrl}/api/webhook/skyvern` : undefined,
    });

    const { data: updated } = await db
      .from('tasks')
      .update({ skyvern_task_id: skyvernTask.task_id, status: 'queued' })
      .eq('id', row.id)
      .select()
      .single();

    return NextResponse.json(updated, { status: 201 });
  } catch (err) {
    // Update status to failed so the UI doesn't show it as stuck
    await db
      .from('tasks')
      .update({ status: 'failed', failure_reason: String(err) })
      .eq('id', row.id);

    return NextResponse.json(
      { error: `Failed to create Skyvern task: ${err}` },
      { status: 502 }
    );
  }
}
