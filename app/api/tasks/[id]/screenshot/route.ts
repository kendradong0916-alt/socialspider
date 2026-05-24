import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { skyvern } from '@/lib/skyvern';

async function proxyImage(url: string): Promise<NextResponse | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = createServerClient();
  const { data: task } = await db
    .from('tasks')
    .select('skyvern_task_id, status')
    .eq('id', params.id)
    .single();

  if (!task?.skyvern_task_id) return new NextResponse(null, { status: 204 });

  try {
    const skyvernTask = await skyvern.getTask(task.skyvern_task_id);

    // screenshot_urls is an array — use the last (most recent) one
    const urls = skyvernTask.screenshot_urls;
    if (urls && urls.length > 0) {
      const res = await proxyImage(urls[urls.length - 1]);
      if (res) return res;
    }
  } catch {
    // fall through
  }

  return new NextResponse(null, { status: 204 });
}
