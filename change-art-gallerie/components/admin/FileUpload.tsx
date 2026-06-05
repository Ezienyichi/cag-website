'use client';

import { useRef, useState } from 'react';

interface Props {
  value: string;
  onChange: (url: string) => void;
  bucket: string;
  label?: string;
}

export default function FileUpload({ value, onChange, bucket, label = 'File' }: Props) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  function getFilename(url: string) {
    try { return decodeURIComponent(url.split('/').pop() || url); } catch { return url; }
  }

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
        <div className="flex items-center gap-3 p-3 bg-surface-container-high rounded-lg mb-2">
          <span className="material-symbols-outlined text-2xl text-primary">description</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{getFilename(value)}</p>
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
              Preview file ↗
            </a>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-error hover:bg-error-container/20 rounded-full p-1 transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-surface-container-high rounded-lg mb-2 border-2 border-dashed border-outline-variant">
          <span className="material-symbols-outlined text-2xl text-on-surface-variant">upload_file</span>
          <p className="text-sm text-on-surface-variant">No file selected</p>
        </div>
      )}

      <input
        ref={ref}
        type="file"
        accept=".pdf,.epub,.doc,.docx"
        onChange={pick}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="px-4 py-2 bg-surface-container-high rounded-lg text-sm font-medium hover:bg-surface-container transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-base">
          {uploading ? 'hourglass_empty' : 'upload_file'}
        </span>
        {uploading ? 'Uploading…' : value ? 'Replace File' : 'Upload File (PDF, EPUB, DOC)'}
      </button>
    </div>
  );
}
