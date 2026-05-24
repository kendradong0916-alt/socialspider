import { NextRequest, NextResponse } from 'next/server';
import { skyvern } from '@/lib/skyvern';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await skyvern.getBrowserSession(params.id);
    return NextResponse.json({
      session_id: session.browser_session_id,
      status: session.status,
      ready: session.status === 'running',
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await skyvern.closeBrowserSession(params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // best-effort close
  }
}
