import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

function auth(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await req.json();

    const supabase = createServerClient();

    const { data: existing } = await supabase.from('products').select('name, slug').eq('id', id).single();
    if (!body.slug) {
      body.slug = (existing && existing.name !== body.name) || !existing?.slug
        ? generateSlug(body.name)
        : existing.slug;
    }
    console.log('Product PATCH body:', JSON.stringify(body));

    const { data, error } = await supabase.from('products').update({
      name: body.name,
      slug: body.slug,
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
    }).eq('id', id).select().single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (err: any) {
    console.error('Products PATCH route crash:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = createServerClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
