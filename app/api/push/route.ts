import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const dynamic = 'force-dynamic'; // évite le cache route

const DATA_DIR = process.env.DATA_DIR || '/data';
const PUSH_TOKEN = process.env.PUSH_TOKEN;

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (!PUSH_TOKEN || !auth.startsWith('Bearer ') || auth.slice(7) !== PUSH_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = Array.isArray(body) ? body : body.data; // accepte {data:[...]} ou [...]
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(join(DATA_DIR, 'availability.json'), JSON.stringify(data, null, 2), 'utf8');

    return NextResponse.json({ ok: true, count: data.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad Request' }, { status: 400 });
  }
}
