import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/admin/check?key=<admin_key>
// Diagnostic route — checks env vars, auth, and bucket existence.
// Use this to debug upload issues without touching the UI.
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key') || req.headers.get('x-admin-key') || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const adminPassword = process.env.ADMIN_PASSWORD || '';

  const results: Record<string, unknown> = {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? '✓ set' : '✗ MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ set' : '✗ MISSING',
      SUPABASE_SERVICE_ROLE_KEY: serviceKey ? `✓ set (ends in ...${serviceKey.slice(-6)})` : '✗ MISSING',
      ADMIN_PASSWORD: adminPassword ? '✓ set' : '✗ MISSING',
    },
    auth: key
      ? key === serviceKey
        ? '✓ x-admin-key matches SUPABASE_SERVICE_ROLE_KEY'
        : '✗ x-admin-key does NOT match SUPABASE_SERVICE_ROLE_KEY'
      : '✗ No key provided — add ?key=<your_admin_key> to the URL',
  };

  if (key === serviceKey && serviceKey) {
    const supabase = createServerClient();
    const BUCKETS = ['product-images', 'gallery-photos', 'book-pages', 'avatars', 'digital-files'];
    const bucketResults: Record<string, string> = {};

    const { data: bucketList, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      results.buckets = `Error listing buckets: ${listError.message}`;
    } else {
      const existingNames = (bucketList || []).map((b) => b.name);
      for (const b of BUCKETS) {
        bucketResults[b] = existingNames.includes(b) ? '✓ exists' : '✗ MISSING — create in Supabase Dashboard → Storage';
      }
      results.buckets = bucketResults;
    }

    // Quick DB check
    const { error: dbError } = await supabase.from('products').select('id').limit(1);
    results.database = dbError ? `✗ DB error: ${dbError.message}` : '✓ products table accessible';
  }

  return NextResponse.json(results, { status: 200 });
}
