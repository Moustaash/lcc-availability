import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
// FIX: Import Buffer to resolve 'Cannot find name Buffer' error.
import { Buffer } from 'node:buffer';

const FEEDS_DIR = process.env.FEEDS_DIR || '/data/feeds';
const PUSH_TOKEN = process.env.PUSH_TOKEN;

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (!PUSH_TOKEN || !auth.startsWith('Bearer ') || auth.slice(7) !== PUSH_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { catalog, files } = await req.json();
    await mkdir(FEEDS_DIR, { recursive: true });

    if (catalog) {
      await writeFile(join(FEEDS_DIR, 'catalog.json'), JSON.stringify(catalog, null, 2), 'utf8');
    }
    if (Array.isArray(files)) {
      for (const f of files) {
        const buf = Buffer.from(f.content, 'base64');
        await writeFile(join(FEEDS_DIR, f.name), buf); // ex: residence-mathilda.ics
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad Request' }, { status: 400 });
  }
}
