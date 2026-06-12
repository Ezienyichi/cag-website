import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('Upload route called');

  try {
    // Auth
    const key = req.headers.get('x-admin-key');
    if (key !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (e: any) {
      console.error('FormData parse failed:', e.message);
      return NextResponse.json({ error: 'Failed to parse upload: ' + e.message }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    const folder = (formData.get('bucket') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('File received:', file.name, file.size, file.type);

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max size is 10MB.' }, { status: 400 });
    }

    // Validate env
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary config');
      return NextResponse.json({ error: 'Server upload config missing' }, { status: 500 });
    }

    // Convert to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Resource type
    const resourceType = file.type.startsWith('image/') ? 'image' : 'raw';

    // Signature
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const sigStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(sigStr).digest('hex');

    // Upload via URL-encoded form (most reliable on Vercel)
    const params = new URLSearchParams();
    params.append('file', dataUri);
    params.append('folder', folder);
    params.append('timestamp', timestamp);
    params.append('api_key', apiKey);
    params.append('signature', signature);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      }
    );

    let uploadData: any;
    try {
      uploadData = await uploadRes.json();
    } catch (e) {
      return NextResponse.json({ error: 'Cloudinary returned invalid response' }, { status: 500 });
    }

    if (!uploadRes.ok) {
      console.error('Cloudinary error:', uploadData);
      return NextResponse.json({ error: uploadData?.error?.message || 'Upload failed' }, { status: 500 });
    }

    console.log('Upload success:', uploadData.secure_url);
    return NextResponse.json({ url: uploadData.secure_url });

  } catch (err: any) {
    console.error('Upload crash:', err);
    return NextResponse.json({ error: err.message || 'Unexpected server error' }, { status: 500 });
  }
}
