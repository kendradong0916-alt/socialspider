import { NextResponse } from 'next/server';
import { skyvern } from '@/lib/skyvern';

// Pre-warm a Skyvern browser session so the browser is ready before task creation
export async function POST() {
  try {
    const session = await skyvern.createBrowserSession(10); // 10 min timeout
    return NextResponse.json({
      session_id: session.browser_session_id,
      status: session.status,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
