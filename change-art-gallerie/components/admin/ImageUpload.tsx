'use client';

import { useRef, useState } from 'react';

interface Props {
  value: string;
  onChange: (url: string) => void;
  bucket: string;
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
        URL.revokeObjectURL(url);
        if (blob) {
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        } else {
          resolve(file);
        }
      }, 'image/jpeg', 0.85);
    };

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export default function ImageUpload({ value, onChange, bucket, label = 'Image' }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const key = sessionStorage.getItem('admin_key') || '';
      if (!key) {
        setError('Not authenticated. Please log out and log in again.');
        return;
      }

      const fileToUpload = file.type.startsWith('image/') ? await compressImage(file) : file;

      const fd = new FormData();
      fd.append('file', fileToUpload);
      fd.append('bucket', bucket);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-key': key },
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        const msg = json.error || `Upload failed (${res.status})`;
        console.error('[ImageUpload] Upload error:', msg, '| bucket:', bucket, '| status:', res.status);
        setError(msg);
        return;
      }
      onChange(json.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error — could not reach server';
      console.error('[ImageUpload] Network error:', err);
      setError(msg);
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = '';
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-on-surface-variant mb-2">{label}</p>
      {value ? (
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
          <img src={value} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
          <button
            type="button"
            onClick={() => { onChange(''); setError(''); }}
            style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: '#b02500', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, lineHeight: '22px', textAlign: 'center' }}
          >×</button>
        </div>
      ) : (
        <div style={{ width: 80, height: 80, borderRadius: 8, border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, color: '#999', fontSize: 11 }}>
          No image
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} />
      <button
        type="button"
        onClick={() => { setError(''); ref.current?.click(); }}
        disabled={uploading}
        className="px-4 py-2 bg-surface-container-high rounded-lg text-sm font-medium hover:bg-surface-container transition-colors disabled:opacity-50"
      >
        {uploading ? 'Uploading…' : 'Choose Image'}
      </button>
      {error && (
        <p className="mt-2 text-xs text-error bg-error-container/20 px-3 py-2 rounded-lg flex items-start gap-1">
          <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
