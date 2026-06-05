'use client';

import { useRef, useState } from 'react';

interface Props {
  value: string;
  onChange: (url: string) => void;
  bucket: string;
  label?: string;
}

export default function ImageUpload({ value, onChange, bucket, label = 'Image' }: Props) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const key = sessionStorage.getItem('admin_key') || '';
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bucket', bucket);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-key': key },
        body: fd,
      });
      const json = await res.json();
      if (json.url) onChange(json.url);
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
            onClick={() => onChange('')}
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
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="px-4 py-2 bg-surface-container-high rounded-lg text-sm font-medium hover:bg-surface-container transition-colors disabled:opacity-50"
      >
        {uploading ? 'Uploading…' : 'Choose Image'}
      </button>
    </div>
  );
}
