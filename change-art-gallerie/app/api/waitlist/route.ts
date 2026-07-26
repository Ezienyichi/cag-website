import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { verifyRecaptcha, isGibberish } from '@/lib/recaptcha';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, full_name, phone, location, role, website, recaptchaToken } = body;

    // Honeypot — bots fill hidden fields, humans don't
    if (website) {
      return NextResponse.json({ success: true });
    }

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Gibberish name check
    if (full_name && isGibberish(full_name)) {
      return NextResponse.json({ success: true }); // fake success
    }

    // reCAPTCHA verification
    if (recaptchaToken) {
      const isHuman = await verifyRecaptcha(recaptchaToken);
      if (!isHuman) {
        return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 400 });
      }
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('waitlist_signups')
      .upsert(
        {
          email: email.toLowerCase().trim(),
          full_name: full_name || '',
          phone: phone || null,
          location: location || null,
          role: role || 'parent',
          source: 'website',
        },
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (error) {
      console.error('Waitlist insert error:', error);
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Waitlist API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
