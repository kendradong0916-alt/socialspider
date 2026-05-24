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
    // 1. Try task-level screenshot_url first (available after completion)
    const skyvernTask = await skyvern.getTask(task.skyvern_task_id);
    if (skyvernTask.screenshot_url) {
      const res = await proxyImage(skyvernTask.screenshot_url);
      if (res) return res;
    }

    // 2. Try step-level screenshots (live, during execution)
    const steps = await skyvern.getSteps(task.skyvern_task_id);
    if (steps.length === 0) return new NextResponse(null, { status: 204 });

    // Pick latest step that has a screenshot
    const candidate =
      [...steps].reverse().find((s) => s.screenshot_url) ??
      steps[steps.length - 1];

    if (candidate.screenshot_url) {
      const res = await proxyImage(candidate.screenshot_url);
      if (res) return res;
    }

    // 3. Try Skyvern's per-step screenshot endpoint as last resort
    const screenshotRes = await skyvern.getStepScreenshot(
      task.skyvern_task_id,
      candidate.step_id
    );
    if (screenshotRes.ok) {
      const buffer = await screenshotRes.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': screenshotRes.headers.get('content-type') ?? 'image/png',
          'Cache-Control': 'no-store',
        },
      });
    }
  } catch {
    // fall through
  }

  return new NextResponse(null, { status: 204 });
}
