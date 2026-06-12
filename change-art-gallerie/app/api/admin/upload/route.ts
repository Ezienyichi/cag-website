import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('=== Upload route hit ===');

  try {
    // Auth check
    const key = req.headers.get('x-admin-key');
    if (key !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (e: any) {
      console.error('FormData error:', e);
      return NextResponse.json({ error: 'Could not read form data' }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    const folder = (formData.get('bucket') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file in request' }, { status: 400 });
    }

    console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Check Cloudinary config
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary env vars:', { cloudName: !!cloudName, apiKey: !!apiKey, apiSecret: !!apiSecret });
      return NextResponse.json({ error: 'Cloudinary not configured on server' }, { status: 500 });
    }

    // Convert file to base64 data URI
    const bytes = new Uint8Array(await file.arrayBuffer());
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUri = 'data:' + file.type + ';base64,' + base64;

    // Determine resource type
    const isImage = file.type.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';

    // Generate Cloudinary signature
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const sigString = 'folder=' + folder + '&timestamp=' + timestamp + apiSecret;
    const signature = crypto.createHash('sha1').update(sigString).digest('hex');

    // POST to Cloudinary REST API using URLSearchParams (reliable on Vercel Edge/Node)
    const cloudForm = new URLSearchParams();
    cloudForm.append('file', dataUri);
    cloudForm.append('folder', folder);
    cloudForm.append('timestamp', timestamp);
    cloudForm.append('api_key', apiKey);
    cloudForm.append('signature', signature);

    console.log('Uploading to Cloudinary, resource_type:', resourceType);

    const cloudRes = await fetch(
      'https://api.cloudinary.com/v1_1/' + cloudName + '/' + resourceType + '/upload',
      {
        method: 'POST',
        body: cloudForm,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const cloudData = await cloudRes.json();

    if (!cloudRes.ok) {
      console.error('Cloudinary rejected:', cloudData);
      return NextResponse.json({ error: cloudData.error?.message || 'Cloudinary upload failed' }, { status: 500 });
    }

    console.log('Upload OK:', cloudData.secure_url);
    return NextResponse.json({ url: cloudData.secure_url });

  } catch (err: any) {
    console.error('Upload route crash:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
