'use client';
import { useState } from 'react';

interface Props {
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
  label?: string;
}

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const img = document.createElement('img');
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1200;
      let w = img.width;
      let h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file);
      }, 'image/jpeg', 0.85);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export default function ImageUpload({ value, onChange, bucket, label = 'Image' }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');

    try {
      const compressed = file.type.startsWith('image/') ? await compressImage(file) : file;

      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'cag-unsigned');
      formData.append('folder', bucket || 'general');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dlmbplaa9s';
      const resourceType = file.type.startsWith('image/') ? 'image' : 'raw';

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: 'POST', body: formData }
      );

      const data = await res.json();

      if (res.ok && data.secure_url) {
        onChange(data.secure_url);
      } else {
        setError(data.error?.message || 'Upload failed');
        console.error('Cloudinary error:', data);
      }
    } catch (err: any) {
      setError('Upload failed: ' + err.message);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="flex items-center gap-4">
        {value && (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
            <img src={value} alt="preview" className="w-full h-full object-cover" />
          </div>
        )}
        <div>
          <label className="cursor-pointer bg-surface-container-high hover:bg-surface-container px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              {uploading ? 'hourglass_empty' : 'upload'}
            </span>
            {uploading ? 'Uploading...' : 'Choose Image'}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
          {error && <p className="text-error text-xs mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}
