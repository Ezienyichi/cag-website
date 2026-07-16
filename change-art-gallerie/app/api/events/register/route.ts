import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_id, full_name, phone, location, email } = body;

    if (!event_id || !full_name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'Full name and phone number are required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, registration_open, max_attendees, whatsapp_link, whatsapp_number')
      .eq('id', event_id)
      .eq('visible', true)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (!event.registration_open) {
      return NextResponse.json({ error: 'Registration is closed for this event' }, { status: 400 });
    }

    if (event.max_attendees) {
      const { count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event_id);
      if ((count ?? 0) >= event.max_attendees) {
        return NextResponse.json({ error: 'This event is full' }, { status: 400 });
      }
    }

    const { error: insertError } = await supabase.from('event_registrations').insert({
      event_id,
      full_name: full_name.trim(),
      phone: phone.trim(),
      location: location?.trim() || null,
      email: email?.trim() || null,
    });

    if (insertError) {
      console.error('Registration insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      whatsapp_link: event.whatsapp_link || null,
      whatsapp_number: event.whatsapp_number || null,
    });
  } catch (err: any) {
    console.error('Registration route crash:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
