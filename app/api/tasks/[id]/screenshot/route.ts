import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { skyvern } from '@/lib/skyvern';

// Proxies the latest Skyvern step screenshot to avoid CORS and keep API key server-side
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

  if (!task?.skyvern_task_id) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const steps = await skyvern.getSteps(task.skyvern_task_id);
    if (steps.length === 0) return new NextResponse(null, { status: 204 });

    // Prefer the last running or completed step that has a screenshot URL
    const candidate =
      [...steps].reverse().find((s) => s.screenshot_url) ??
      steps[steps.length - 1];

    // Case 1: step already carries a public screenshot_url (signed S3 etc.)
    if (candidate.screenshot_url) {
      const imgRes = await fetch(candidate.screenshot_url);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': imgRes.headers.get('content-type') ?? 'image/png',
            'Cache-Control': 'no-store',
          },
        });
      }
    }

    // Case 2: fetch from Skyvern screenshot endpoint
    const screenshotRes = await skyvern.getStepScreenshot(
      task.skyvern_task_id,
      candidate.step_id
    );

    if (!screenshotRes.ok) return new NextResponse(null, { status: 204 });

    const buffer = await screenshotRes.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': screenshotRes.headers.get('content-type') ?? 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
