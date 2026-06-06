import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { Readable } from 'stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    // Auth
    const key = req.headers.get('x-admin-key');
    if (key !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[upload] Unauthorized — x-admin-key mismatch');
      return NextResponse.json({ error: 'Unauthorized. Check your admin session.' }, { status: 401 });
    }

    // Env check
    console.log('CLOUDINARY_CLOUD_NAME exists:', !!process.env.CLOUDINARY_CLOUD_NAME);
    console.log('CLOUDINARY_API_KEY exists:', !!process.env.CLOUDINARY_API_KEY);
    console.log('CLOUDINARY_API_SECRET exists:', !!process.env.CLOUDINARY_API_SECRET);

    // Parse form data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err: any) {
      console.error('[upload] Failed to parse formData:', err?.message);
      return NextResponse.json({ error: 'Failed to parse request. File may be too large.' }, { status: 413 });
    }

    const file = formData.get('file') as File | null;
    const folder = (formData.get('bucket') as string | null) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    // Size check
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum size is 10 MB (your file: ${(file.size / 1024 / 1024).toFixed(1)} MB).` },
        { status: 413 }
      );
    }

    console.log(`[upload] "${file.name}" — ${(file.size / 1024).toFixed(1)} KB, type: ${file.type}, folder: ${folder}`);

    // Convert to buffer
    let buffer: Buffer;
    try {
      buffer = Buffer.from(await file.arrayBuffer());
    } catch (err: any) {
      console.error('[upload] arrayBuffer error:', err?.message);
      return NextResponse.json({ error: 'Failed to read file data.' }, { status: 500 });
    }

    const isDocument = file.type === 'application/pdf'
      || ['pdf', 'epub', 'doc', 'docx'].some(ext => file.name.toLowerCase().endsWith(`.${ext}`));

    // Upload to Cloudinary
    let result: { secure_url: string };
    try {
      result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: isDocument ? 'raw' : 'image' },
          (error, res) => {
            if (error) reject(error);
            else resolve(res as { secure_url: string });
          }
        );
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        readable.pipe(stream);
      });
    } catch (err: any) {
      console.error('[upload] Cloudinary upload_stream error:', err?.message || err);
      return NextResponse.json({ error: `Cloudinary error: ${err?.message || 'unknown'}` }, { status: 500 });
    }

    console.log('[upload] Success:', result.secure_url);
    return NextResponse.json({ url: result.secure_url });

  } catch (err: any) {
    // Outer catch — nothing should reach here, but never return plain text
    console.error('[upload] Unhandled error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Unexpected server error' }, { status: 500 });
  }
}
