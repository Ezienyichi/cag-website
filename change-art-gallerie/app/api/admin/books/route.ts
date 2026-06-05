import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');

    let query = supabase
      .from('book_pages')
      .select('*')
      .order('sort_order', { ascending: true });

    if (level) query = query.eq('book_level', level);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ pages: data });
  } catch (err) {
    console.error('Admin books GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('book_pages')
      .insert({
        book_level: body.book_level,
        image_url: body.image_url,
        sort_order: body.sort_order ?? 0,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ page: data }, { status: 201 });
  } catch (err) {
    console.error('Admin books POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
