import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.SUPABASE_SERVICE_ROLE_KEY;
}

// Body: { ids: string[] } — array of page IDs in their new order
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ids } = await req.json() as { ids: string[] };
    const supabase = createServerClient();

    const updates = ids.map((id, index) =>
      supabase.from('book_pages').update({ sort_order: index }).eq('id', id)
    );

    await Promise.all(updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin books reorder error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
