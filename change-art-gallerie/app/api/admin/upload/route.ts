import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

function auth(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const fd = await req.formData();
    const file = fd.get('file') as File;
    const bucket = fd.get('bucket') as string;
    if (!file || !bucket) return NextResponse.json({ error: 'Missing file or bucket' }, { status: 400 });

    const supabase = createServerClient();
    const ext = file.name.split('.').pop();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buf = new Uint8Array(await file.arrayBuffer());

    const { error } = await supabase.storage.from(bucket).upload(name, buf, { contentType: file.type });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data } = supabase.storage.from(bucket).getPublicUrl(name);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
