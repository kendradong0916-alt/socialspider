// Deprecated — use GET /api/tasks/[id] instead
import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('task_id');
  if (!id) return NextResponse.json({ error: 'task_id required' }, { status: 400 });
  return fetch(new URL(`/api/tasks/${id}`, req.url));
}
