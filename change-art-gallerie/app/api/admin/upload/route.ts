import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

function auth(req: NextRequest) {
  const key = req.headers.get('x-admin-key');
  const expected = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!expected) {
    console.error('[upload] SUPABASE_SERVICE_ROLE_KEY env var is not set');
    return false;
  }
  return key === expected;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) {
    console.error('[upload] Unauthorized — x-admin-key did not match');
    return NextResponse.json({ error: 'Unauthorized. Check your admin session.' }, { status: 401 });
  }

  try {
    const fd = await req.formData();
    const file = fd.get('file') as File | null;
    const bucket = fd.get('bucket') as string | null;

    if (!file || !bucket) {
      console.error('[upload] Missing file or bucket. file:', !!file, 'bucket:', bucket);
      return NextResponse.json({ error: 'Missing file or bucket' }, { status: 400 });
    }

    console.log(`[upload] Uploading "${file.name}" (${file.size} bytes, ${file.type}) to bucket "${bucket}"`);

    const supabase = createServerClient();
    const ext = file.name.split('.').pop() || 'bin';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(name, buffer, { contentType: file.type || 'application/octet-stream' });

    if (uploadError) {
      console.error(`[upload] Supabase storage error for bucket "${bucket}":`, uploadError.message);
      // Provide a clearer message for common errors
      if (uploadError.message.includes('Bucket not found')) {
        return NextResponse.json(
          { error: `Storage bucket "${bucket}" does not exist. Create it in Supabase Dashboard → Storage.` },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(name);
    console.log(`[upload] Success: ${data.publicUrl}`);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e) {
    console.error('[upload] Unexpected error:', e);
    return NextResponse.json({ error: 'Server error during upload' }, { status: 500 });
  }
}
