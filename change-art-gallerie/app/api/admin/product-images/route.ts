import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

function auth(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const productId = req.nextUrl.searchParams.get('product_id');
  if (!productId) return NextResponse.json({ error: 'Missing product_id' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ images: data || [] });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { product_id, image_url, sort_order = 0 } = body;

  if (!product_id || !image_url) {
    return NextResponse.json({ error: 'Missing product_id or image_url' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('product_images')
    .insert({ product_id, image_url, sort_order })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ image: data }, { status: 201 });
}
