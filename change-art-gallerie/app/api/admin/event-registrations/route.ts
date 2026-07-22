import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

function isAdmin(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createServerClient();
  const { data, error, count } = await supabase
    .from('event_registrations')
    .select('*, events(title, event_date)', { count: 'exact' })
    .order('registered_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ registrations: data, total: count });
}
