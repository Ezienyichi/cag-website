import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ success: false, error: 'Password required' }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD env var not set');
      return NextResponse.json({ success: false, error: 'Server misconfigured' }, { status: 500 });
    }

    if (password !== adminPassword) {
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
    }

    const token = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!token) {
      console.error('SUPABASE_SERVICE_ROLE_KEY env var not set');
      return NextResponse.json({ success: false, error: 'Server misconfigured' }, { status: 500 });
    }

    return NextResponse.json({ success: true, token });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
