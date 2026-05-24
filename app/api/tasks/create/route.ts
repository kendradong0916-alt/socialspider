// Deprecated — use POST /api/tasks instead
import { NextRequest } from 'next/server';
export const POST = (req: NextRequest) =>
  fetch(new URL('/api/tasks', req.url), { method: 'POST', body: req.body, headers: req.headers });
