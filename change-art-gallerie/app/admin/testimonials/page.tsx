'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  avatar_url: string | null;
  featured: boolean;
  sort_order: number;
}

const BLANK = { name: '', role: '', quote: '', avatar_url: '', featured: false, sort_order: 0 };

function key() { return typeof window !== 'undefined' ? sessionStorage.getItem('admin_key') || '' : ''; }

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/testimonials', { headers: { 'x-admin-key': key() } });
      const d = await r.json();
      setItems(d.testimonials || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }

  function openAdd() { setEditing(null); setForm({ ...BLANK, sort_order: items.length }); setModal(true); }

  function openEdit(t: Testimonial) {
    setEditing(t);
    setForm({ name: t.name, role: t.role || '', quote: t.quote, avatar_url: t.avatar_url || '', featured: t.featured, sort_order: t.sort_order });
    setModal(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/admin/testimonials/${editing.id}` : '/api/admin/testimonials';
      const r = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key() },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      toast.success(editing ? 'Updated!' : 'Added!');
      setModal(false);
      load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  }

  async function del(t: Testimonial) {
    try {
      const r = await fetch(`/api/admin/testimonials/${t.id}`, { method: 'DELETE', headers: { 'x-admin-key': key() } });
      if (!r.ok) throw new Error();
      toast.success('Deleted');
      setDeleteTarget(null);
      load();
    } catch { toast.error('Failed to delete'); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 className="text-2xl font-bold font-headline">Testimonials</h1>
          <p className="text-on-surface-variant text-sm mt-1">Testimonials marked "featured" appear on the homepage.</p>
        </div>
        <button onClick={openAdd} className="bg-primary text-on-primary px-5 py-2.5 rounded-full font-bold text-sm font-headline">
          + Add Testimonial
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
        {loading && <p className="p-8 text-center text-on-surface-variant">Loading…</p>}
        {!loading && items.length === 0 && (
          <div className="p-12 text-center text-on-surface-variant">
            <p className="font-bold mb-4">No testimonials yet</p>
            <button onClick={openAdd} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm">Add Testimonial</button>
          </div>
        )}
        {!loading && items.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            {/* Avatar */}
            <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', background: '#eee', flexShrink: 0 }}>
              {t.avatar_url
                ? <img src={t.avatar_url} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 18, fontWeight: 700 }}>{t.name[0]}</div>
              }
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</span>
                {t.featured && <span style={{ background: '#feb300', color: '#7b5400', borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>Featured</span>}
              </div>
              {t.role && <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{t.role}</p>}
              <p style={{ fontSize: 13, color: '#555', marginTop: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
            {/* Actions */}
            <button onClick={() => openEdit(t)} className="px-4 py-2 rounded-lg bg-surface-container-high text-sm font-medium" style={{ marginRight: 8 }}>Edit</button>
            <button onClick={() => setDeleteTarget(t)} className="px-4 py-2 rounded-lg text-sm font-medium text-error hover:bg-error-container/20">Delete</button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: '#fff' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button onClick={() => setModal(false)} style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={save} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mrs. Adaeze Okonkwo" className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>Role / School</label>
                <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g. Head Teacher, Favor Heights Montessori" className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>Quote *</label>
                <textarea required value={form.quote} onChange={e => setForm({ ...form, quote: e.target.value })} rows={4} placeholder="What did they say about the books?" className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm resize-none" />
              </div>
              <ImageUpload value={form.avatar_url} onChange={url => setForm({ ...form, avatar_url: url })} bucket="avatars" label="Profile Photo (optional)" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm" />
                </div>
                <div style={{ paddingTop: 28 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} style={{ width: 16, height: 16 }} />
                    Featured on homepage
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="button" onClick={() => setModal(false)} style={{ flex: 1, padding: 12, borderRadius: 99, border: '1.5px solid #ddd', background: 'none', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
                <button type="submit" disabled={saving} className="bg-primary text-on-primary font-bold disabled:opacity-60" style={{ flex: 1, padding: 12, borderRadius: 99, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Testimonial'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 360, width: '100%', padding: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Delete Testimonial?</h2>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>&ldquo;{deleteTarget.name}&rdquo; will be permanently removed.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: 11, borderRadius: 99, border: '1.5px solid #ddd', background: 'none', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={() => del(deleteTarget)} style={{ flex: 1, padding: 11, borderRadius: 99, background: '#b02500', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
