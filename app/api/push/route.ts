import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
// FIX: Explicitly import `process` from `node:process` to resolve the TypeScript error
// "Property 'cwd' does not exist on type 'Process'".
import { process } from 'node:process';

export const dynamic = 'force-dynamic'; // évite le cache route

// Correction : Écrire dans le dossier `public` pour que le fichier soit servi statiquement
const DATA_DIR = join(process.cwd(), 'public', 'data');
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

    // S'assurer que le répertoire de destination existe
    await mkdir(DATA_DIR, { recursive: true });
    
    // Écrire le fichier de disponibilité
    await writeFile(join(DATA_DIR, 'availability.json'), JSON.stringify(data, null, 2), 'utf8');

    return NextResponse.json({ ok: true, count: data.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad Request' }, { status: 400 });
  }
}
