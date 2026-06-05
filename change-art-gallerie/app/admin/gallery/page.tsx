'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

interface Photo { id: string; image_url: string; caption: string | null; sort_order: number; }

function key() { return typeof window !== 'undefined' ? sessionStorage.getItem('admin_key') || '' : ''; }

export default function GalleryAdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/gallery', { headers: { 'x-admin-key': key() } });
      const d = await r.json();
      setPhotos(d.photos || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }

  async function add() {
    if (!newUrl) { toast.error('Please select an image first'); return; }
    setAdding(true);
    try {
      const r = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key() },
        body: JSON.stringify({ image_url: newUrl, caption: newCaption || null, sort_order: photos.length }),
      });
      if (!r.ok) throw new Error();
      toast.success('Photo added!');
      setNewUrl('');
      setNewCaption('');
      load();
    } catch { toast.error('Failed to add'); }
    finally { setAdding(false); }
  }

  async function del(p: Photo) {
    try {
      const r = await fetch(`/api/admin/gallery/${p.id}`, { method: 'DELETE', headers: { 'x-admin-key': key() } });
      if (!r.ok) throw new Error();
      toast.success('Photo deleted');
      setDeleteTarget(null);
      load();
    } catch { toast.error('Failed to delete'); }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-headline mb-8">Gallery Photos</h1>

      {/* ── Upload panel ── */}
      <div className="bg-surface-container-lowest rounded-xl ambient-shadow p-6 mb-8">
        <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Add New Photo</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          <ImageUpload
            value={newUrl}
            onChange={setNewUrl}
            bucket="gallery-photos"
            label="Photo"
          />
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>Caption (optional)</label>
            <input
              value={newCaption}
              onChange={e => setNewCaption(e.target.value)}
              placeholder="e.g. Students enjoying Nursery 1 workbook"
              className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface mb-4"
            />
            <button
              onClick={add}
              disabled={adding || !newUrl}
              className="w-full bg-primary text-on-primary py-3 rounded-full font-bold text-sm disabled:opacity-50"
            >
              {adding ? 'Adding…' : 'Add Photo'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Photo grid ── */}
      <div className="bg-surface-container-lowest rounded-xl ambient-shadow p-6">
        <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>{photos.length} Photos in Gallery</h2>

        {loading && <p className="text-center text-on-surface-variant py-8">Loading…</p>}
        {!loading && photos.length === 0 && (
          <p className="text-center text-on-surface-variant py-12">No photos yet. Upload your first photo above.</p>
        )}

        {!loading && photos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {photos.map((p, i) => (
              <div key={p.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#f5f5f5' }}>
                <img
                  src={p.image_url}
                  alt={p.caption || `Photo ${i + 1}`}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                />
                {p.caption && (
                  <div style={{ padding: '6px 8px', fontSize: 11, color: '#555', background: '#f9f9f9', lineHeight: 1.3 }}>
                    {p.caption}
                  </div>
                )}
                <button
                  onClick={() => setDeleteTarget(p)}
                  style={{ position: 'absolute', top: 6, right: 6, background: '#b02500', color: '#fff', border: 'none', borderRadius: 99, width: 26, height: 26, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 360, width: '100%', padding: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Delete Photo?</h2>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>This photo will be removed from the gallery permanently.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: '11px', borderRadius: 99, border: '1.5px solid #ddd', background: 'none', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={() => del(deleteTarget)} style={{ flex: 1, padding: '11px', borderRadius: 99, background: '#b02500', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
