import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

function isAdmin(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createServerClient();
  const { data, error, count } = await supabase
    .from('resource_leads')
    .select('*, resources(title)', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data ?? [], total: count ?? 0 });
}
