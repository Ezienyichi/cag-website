'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

interface Photo { id: string; image_url: string; caption: string | null; sort_order: number; }
interface Testimonial { id: string; name: string; role: string | null; quote: string; avatar_url: string | null; featured: boolean; sort_order: number; }

const T_BLANK = { name: '', role: '', quote: '', avatar_url: '', featured: false, sort_order: 0 };

function key() { return typeof window !== 'undefined' ? sessionStorage.getItem('admin_key') || '' : ''; }

export default function GalleryAdminPage() {
  const [activeTab, setActiveTab] = useState<'photos' | 'testimonials'>('photos');

  // Gallery Photos state
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [adding, setAdding] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);

  // Testimonials state
  const [items, setItems] = useState<Testimonial[]>([]);
  const [tLoading, setTLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(T_BLANK);
  const [saving, setSaving] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null);

  useEffect(() => {
    loadPhotos();
    loadTestimonials();
  }, []);

  async function loadPhotos() {
    setPhotosLoading(true);
    try {
      const r = await fetch('/api/admin/gallery', { headers: { 'x-admin-key': key() } });
      const d = await r.json();
      setPhotos(d.photos || []);
    } catch { toast.error('Failed to load photos'); }
    finally { setPhotosLoading(false); }
  }

  async function addPhoto() {
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
      loadPhotos();
    } catch { toast.error('Failed to add photo'); }
    finally { setAdding(false); }
  }

  async function deletePhoto(p: Photo) {
    try {
      const r = await fetch(`/api/admin/gallery/${p.id}`, { method: 'DELETE', headers: { 'x-admin-key': key() } });
      if (!r.ok) throw new Error();
      toast.success('Photo deleted');
      setPhotoToDelete(null);
      loadPhotos();
    } catch { toast.error('Failed to delete photo'); }
  }

  async function loadTestimonials() {
    setTLoading(true);
    try {
      const r = await fetch('/api/admin/testimonials', { headers: { 'x-admin-key': key() } });
      const d = await r.json();
      setItems(d.testimonials || []);
    } catch { toast.error('Failed to load testimonials'); }
    finally { setTLoading(false); }
  }

  function openAddTestimonial() {
    setEditing(null);
    setForm({ ...T_BLANK, sort_order: items.length });
    setModal(true);
  }

  function openEditTestimonial(t: Testimonial) {
    setEditing(t);
    setForm({ name: t.name, role: t.role || '', quote: t.quote, avatar_url: t.avatar_url || '', featured: t.featured, sort_order: t.sort_order });
    setModal(true);
  }

  async function saveTestimonial(e: React.FormEvent) {
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
      loadTestimonials();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  }

  async function deleteTestimonial(t: Testimonial) {
    try {
      const r = await fetch(`/api/admin/testimonials/${t.id}`, { method: 'DELETE', headers: { 'x-admin-key': key() } });
      if (!r.ok) throw new Error();
      toast.success('Deleted');
      setTestimonialToDelete(null);
      loadTestimonials();
    } catch { toast.error('Failed to delete'); }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-headline mb-6">Gallery &amp; Testimonials</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-outline-variant/20">
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-5 py-2.5 font-bold text-sm font-headline rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'photos'
              ? 'bg-primary-container/20 text-primary border-b-2 border-primary -mb-px'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">photo_library</span>
          Gallery Photos
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-5 py-2.5 font-bold text-sm font-headline rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'testimonials'
              ? 'bg-primary-container/20 text-primary border-b-2 border-primary -mb-px'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">format_quote</span>
          Testimonials
        </button>
      </div>

      {/* ─── GALLERY PHOTOS TAB ─── */}
      {activeTab === 'photos' && (
        <div>
          <div className="bg-surface-container-lowest rounded-xl ambient-shadow p-6 mb-8">
            <h2 className="font-bold text-base mb-4">Add New Photo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <ImageUpload value={newUrl} onChange={setNewUrl} bucket="gallery-photos" label="Photo" />
              <div>
                <label className="text-sm font-medium text-on-surface-variant block mb-1">Caption (optional)</label>
                <input
                  value={newCaption}
                  onChange={e => setNewCaption(e.target.value)}
                  placeholder="e.g. Students enjoying Nursery 1 workbook"
                  className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface mb-4"
                />
                <button
                  onClick={addPhoto}
                  disabled={adding || !newUrl}
                  className="w-full bg-primary text-on-primary py-3 rounded-full font-bold text-sm disabled:opacity-50"
                >
                  {adding ? 'Adding…' : 'Add Photo'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl ambient-shadow p-6">
            <h2 className="font-bold text-base mb-4">{photos.length} Photo{photos.length !== 1 ? 's' : ''} in Gallery</h2>
            {photosLoading && <p className="text-center text-on-surface-variant py-8">Loading…</p>}
            {!photosLoading && photos.length === 0 && (
              <p className="text-center text-on-surface-variant py-12">No photos yet. Upload your first photo above.</p>
            )}
            {!photosLoading && photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {photos.map((p, i) => (
                  <div key={p.id} className="relative rounded-xl overflow-hidden bg-surface-container-high">
                    <img src={p.image_url} alt={p.caption || `Photo ${i + 1}`} className="w-full aspect-square object-cover block" />
                    {p.caption && (
                      <div className="px-2 py-1.5 text-xs text-on-surface-variant leading-snug">{p.caption}</div>
                    )}
                    <button
                      onClick={() => setPhotoToDelete(p)}
                      className="absolute top-2 right-2 bg-error text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold hover:scale-110 transition-transform"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {photoToDelete && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-surface-container-lowest rounded-xl max-w-sm w-full p-6">
                <h2 className="text-lg font-bold font-headline mb-2">Delete Photo?</h2>
                <p className="text-on-surface-variant text-sm mb-6">This photo will be removed from the gallery permanently.</p>
                <div className="flex gap-3">
                  <button onClick={() => setPhotoToDelete(null)} className="flex-1 py-3 rounded-full border border-outline-variant font-bold text-sm hover:bg-surface-container-high transition-colors">Cancel</button>
                  <button onClick={() => deletePhoto(photoToDelete)} className="flex-1 py-3 rounded-full bg-error text-on-error font-bold text-sm">Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TESTIMONIALS TAB ─── */}
      {activeTab === 'testimonials' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-on-surface-variant text-sm">Testimonials marked &ldquo;featured&rdquo; appear on the homepage.</p>
            <button
              onClick={openAddTestimonial}
              className="bg-primary text-on-primary px-5 py-2.5 rounded-full font-bold text-sm font-headline flex items-center gap-2 hover:scale-105 transition-all"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add Testimonial
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
            {tLoading && <p className="p-8 text-center text-on-surface-variant">Loading…</p>}
            {!tLoading && items.length === 0 && (
              <div className="p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-3 block">format_quote</span>
                <p className="font-bold mb-4">No testimonials yet</p>
                <button onClick={openAddTestimonial} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm">Add Testimonial</button>
              </div>
            )}
            {!tLoading && items.map(t => (
              <div key={t.id} className="flex items-start gap-4 px-5 py-4 border-b border-outline-variant/10 hover:bg-surface-container-low/30 transition-colors">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high shrink-0 flex items-center justify-center">
                  {t.avatar_url
                    ? <img src={t.avatar_url} alt={t.name} className="w-full h-full object-cover" />
                    : <span className="font-bold text-on-surface-variant text-lg">{t.name[0]}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{t.name}</span>
                    {t.featured && <span className="bg-primary-container/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold">Featured</span>}
                  </div>
                  {t.role && <p className="text-xs text-on-surface-variant mt-0.5">{t.role}</p>}
                  <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEditTestimonial(t)} className="px-3 py-1.5 rounded-lg bg-surface-container-high text-sm font-medium hover:bg-surface-container transition-colors">Edit</button>
                  <button onClick={() => setTestimonialToDelete(t)} className="px-3 py-1.5 rounded-lg text-sm font-medium text-error hover:bg-error-container/20 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>

          {modal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-surface-container-lowest rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 sticky top-0 bg-surface-container-lowest z-10">
                  <h2 className="text-xl font-bold font-headline">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
                  <button onClick={() => setModal(false)} className="p-2 rounded-lg hover:bg-surface-container-high">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <form onSubmit={saveTestimonial} className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-on-surface-variant block mb-1">Name *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mrs. Adaeze Okonkwo" className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-on-surface-variant block mb-1">Role / School</label>
                    <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g. Head Teacher, Favor Heights Montessori" className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-on-surface-variant block mb-1">Quote *</label>
                    <textarea required value={form.quote} onChange={e => setForm({ ...form, quote: e.target.value })} rows={4} placeholder="What did they say about the books?" className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface resize-none" />
                  </div>
                  <ImageUpload value={form.avatar_url} onChange={url => setForm({ ...form, avatar_url: url })} bucket="avatars" label="Profile Photo (optional)" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-on-surface-variant block mb-1">Sort Order</label>
                      <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface" />
                    </div>
                    <div className="flex items-end pb-3">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-primary" />
                        <span className="text-sm font-medium">Featured on homepage</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModal(false)} className="flex-1 py-3 rounded-full border border-outline-variant text-sm font-bold font-headline hover:bg-surface-container-high transition-colors">Cancel</button>
                    <button type="submit" disabled={saving} className="flex-1 py-3 rounded-full bg-primary text-on-primary text-sm font-bold font-headline disabled:opacity-60">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Testimonial'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {testimonialToDelete && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-surface-container-lowest rounded-xl max-w-sm w-full p-6">
                <h2 className="text-lg font-bold font-headline mb-2">Delete Testimonial?</h2>
                <p className="text-on-surface-variant text-sm mb-6">&ldquo;{testimonialToDelete.name}&rdquo; will be permanently removed.</p>
                <div className="flex gap-3">
                  <button onClick={() => setTestimonialToDelete(null)} className="flex-1 py-3 rounded-full border border-outline-variant font-bold text-sm hover:bg-surface-container-high transition-colors">Cancel</button>
                  <button onClick={() => deleteTestimonial(testimonialToDelete)} className="flex-1 py-3 rounded-full bg-error text-on-error font-bold text-sm">Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
