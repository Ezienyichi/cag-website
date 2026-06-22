import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

function auth(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

export async function POST(req: NextRequest) {
  try {
    const key = req.headers.get('x-admin-key');
    console.log('Auth key present:', !!key);
    console.log('Expected key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('Keys match:', key === process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (key !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Product body:', JSON.stringify(body));

    const supabase = createServerClient();
    const { data, error } = await supabase.from('products').insert({
      name: body.name,
      description: body.description || null,
      price: body.price,
      category: body.category,
      image_url: body.image_url || null,
      file_url: body.file_url || null,
      featured: body.featured ?? false,
      in_stock: body.in_stock ?? true,
      sort_order: body.sort_order ?? 0,
      delivery_type: body.delivery_type || 'physical',
      free_resource_url: body.free_resource_url || null,
      free_resource_title: body.free_resource_title || null,
    }).select().single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (err: any) {
    console.error('Products POST route crash:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
