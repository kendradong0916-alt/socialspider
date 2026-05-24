import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { skyvern } from '@/lib/skyvern';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = createServerClient();
  const { data: task } = await db
    .from('tasks')
    .select('skyvern_task_id')
    .eq('id', params.id)
    .single();

  if (!task?.skyvern_task_id) {
    return NextResponse.json([]);
  }

  try {
    const steps = await skyvern.getSteps(task.skyvern_task_id);
    return NextResponse.json(steps);
  } catch {
    return NextResponse.json([]);
  }
}
