'use client';
import { useState } from 'react';

interface Props {
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
  label?: string;
}

export default function FileUpload({ value, onChange, bucket, label = 'File' }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'cag-unsigned');
      formData.append('folder', bucket || 'digital-files');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dlmbplaa9s';

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        { method: 'POST', body: formData }
      );

      const data = await res.json();

      if (res.ok && data.secure_url) {
        onChange(data.secure_url);
      } else {
        setError(data.error?.message || 'Upload failed');
      }
    } catch (err: any) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="flex items-center gap-4">
        {value && (
          <div className="flex items-center gap-2 bg-surface-container-high px-3 py-2 rounded-lg shrink-0">
            <span className="material-symbols-outlined text-lg text-primary">description</span>
            <span className="text-sm truncate max-w-[150px]">{fileName || 'File uploaded'}</span>
          </div>
        )}
        <div>
          <label className="cursor-pointer bg-surface-container-high hover:bg-surface-container px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              {uploading ? 'hourglass_empty' : 'upload_file'}
            </span>
            {uploading ? 'Uploading...' : 'Choose File'}
            <input type="file" accept=".pdf,.epub,.doc,.docx" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
          {error && <p className="text-error text-xs mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}
