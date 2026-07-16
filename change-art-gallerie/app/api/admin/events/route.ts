import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

function auth(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('events')
    .select('*, event_registrations(count)')
    .order('event_date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: data });
}

export async function POST(req: NextRequest) {
  try {
    if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const supabase = createServerClient();
    const { data, error } = await supabase.from('events').insert({
      title: body.title,
      description: body.description || null,
      short_description: body.short_description || null,
      event_date: body.event_date || null,
      event_time: body.event_time || null,
      end_date: body.end_date || null,
      end_time: body.end_time || null,
      location: body.location || null,
      location_url: body.location_url || null,
      flyer_url: body.flyer_url || null,
      additional_images: body.additional_images || [],
      whatsapp_link: body.whatsapp_link || null,
      whatsapp_number: body.whatsapp_number || null,
      registration_open: body.registration_open ?? true,
      visible: body.visible ?? true,
      featured: body.featured ?? false,
      event_type: body.event_type || 'training',
      price: body.price ?? 0,
      max_attendees: body.max_attendees || null,
      sort_order: body.sort_order ?? 0,
    }).select().single();
    if (error) {
      console.error('Events POST error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ event: data }, { status: 201 });
  } catch (err: any) {
    console.error('Events POST crash:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
