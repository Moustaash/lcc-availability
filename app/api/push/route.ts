// /app/api/push/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = process.env.DATA_DIR || '/data';
const PUSH_TOKEN = process.env.PUSH_TOKEN;

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (!PUSH_TOKEN || !auth.startsWith('Bearer ') || auth.slice(7) !== PUSH_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(join(DATA_DIR, 'availability.json'), JSON.stringify(body.data, null, 2));
  
    return NextResponse.json({ ok: true, count: body.data?.length || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad Request' }, { status: 400 });
  }
}