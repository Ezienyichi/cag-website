import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

function isAdmin(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key');
  return adminKey === process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');

  let query = supabase
    .from('waitlist_signups')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (role && role !== 'all') query = query.eq('role', role);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 });
  }

  return NextResponse.json({ signups: data, total: count });
}

// Delete a waitlist entry
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();
  const supabase = createServerClient();

  const { error } = await supabase
    .from('waitlist_signups')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
