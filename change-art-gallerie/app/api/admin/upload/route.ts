import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { Readable } from 'stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const key = req.headers.get('x-admin-key');
    if (key !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[upload] Unauthorized — x-admin-key did not match');
      return NextResponse.json({ error: 'Unauthorized. Check your admin session.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('bucket') as string | null) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    console.log(`[upload] Uploading "${file.name}" (${file.size} bytes, ${file.type}) to folder "${folder}"`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isDocument = isPDF || ['epub', 'doc', 'docx'].some(ext => file.name.endsWith(`.${ext}`));

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: isDocument ? 'raw' : 'image',
        },
        (error, result) => {
          if (error) {
            console.error('[upload] Cloudinary error:', error);
            reject(error);
          } else {
            resolve(result as { secure_url: string });
          }
        }
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(stream);
    });

    console.log(`[upload] Success: ${result.secure_url}`);
    return NextResponse.json({ url: result.secure_url });
  } catch (err: any) {
    console.error('[upload] Unexpected error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
