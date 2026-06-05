'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  file_url: string | null;
  featured: boolean;
  in_stock: boolean;
  sort_order: number;
}

const BLANK = {
  name: '',
  description: '',
  price: 0,
  category: 'workbooks',
  image_url: '',
  file_url: '',
  featured: false,
  in_stock: true,
  sort_order: 0,
};

function key() {
  return typeof window !== 'undefined' ? sessionStorage.getItem('admin_key') || '' : '';
}

function fmt(kobo: number) {
  return '₦' + (kobo / 100).toLocaleString('en-NG');
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/products', { headers: { 'x-admin-key': key() } });
      const d = await r.json();
      setProducts(d.products || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditing(null);
    setForm({ ...BLANK, sort_order: products.length });
    setModal(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      category: p.category,
      image_url: p.image_url || '',
      file_url: p.file_url || '',
      featured: p.featured,
      in_stock: p.in_stock,
      sort_order: p.sort_order,
    });
    setModal(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products';
      const method = editing ? 'PATCH' : 'POST';
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key() },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      toast.success(editing ? 'Product updated!' : 'Product added!');
      setModal(false);
      load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  }

  async function del(p: Product) {
    try {
      const r = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE', headers: { 'x-admin-key': key() } });
      if (!r.ok) throw new Error();
      toast.success('Deleted');
      setConfirmDelete(null);
      load();
    } catch { toast.error('Failed to delete'); }
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 className="text-2xl font-bold font-headline">Products</h1>
        <button
          onClick={openAdd}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-full font-bold text-sm font-headline"
        >
          + Add Product
        </button>
      </div>

      {/* ── List ── */}
      <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
        {loading && <p className="p-8 text-center text-on-surface-variant">Loading…</p>}

        {!loading && products.length === 0 && (
          <div className="p-12 text-center text-on-surface-variant">
            <p className="text-lg font-bold mb-2">No products yet</p>
            <p className="mb-6 text-sm">Click "Add Product" to create your first product.</p>
            <button onClick={openAdd} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm">
              Add Product
            </button>
          </div>
        )}

        {!loading && products.length > 0 && products.map((p) => (
          <div
            key={p.id}
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
          >
            {/* Thumbnail */}
            <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', background: '#f0f0f0', flexShrink: 0 }}>
              {p.image_url
                ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 11 }}>No img</div>
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</p>
              <p style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                {p.category} &nbsp;·&nbsp; {fmt(p.price)}
                {p.featured && <span style={{ marginLeft: 8, background: '#feb300', color: '#7b5400', borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>Featured</span>}
                {!p.in_stock && <span style={{ marginLeft: 8, background: '#fde8e0', color: '#b02500', borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>Out of stock</span>}
              </p>
            </div>

            {/* Actions */}
            <button
              onClick={() => openEdit(p)}
              className="px-4 py-2 rounded-lg bg-surface-container-high text-sm font-medium hover:bg-surface-container"
              style={{ marginRight: 8 }}
            >
              Edit
            </button>
            <button
              onClick={() => setConfirmDelete(p)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-error hover:bg-error-container/20"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 0 }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setModal(false)} style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>×</button>
            </div>

            {/* Modal form */}
            <form onSubmit={save} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>Product Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Creative Arts — Nursery 1"
                  className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface"
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Short description shown on product cards"
                  className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface resize-none"
                />
              </div>

              {/* Price + Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>Price (₦ Naira) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.price / 100}
                    onChange={e => setForm({ ...form, price: Math.round(parseFloat(e.target.value || '0') * 100) })}
                    placeholder="3500"
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface"
                  />
                  <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Saved as {form.price} kobo</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>Category *</label>
                  <select
                    required
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface"
                  >
                    <option value="workbooks">Workbooks</option>
                    <option value="homeschooling">Homeschooling</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>
              </div>

              {/* Image upload */}
              <ImageUpload
                value={form.image_url}
                onChange={url => setForm({ ...form, image_url: url })}
                bucket="product-images"
                label="Cover Image"
              />

              {/* Digital file URL */}
              {(form.category === 'digital' || form.category === 'homeschooling') && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>Download File URL</label>
                  <input
                    value={form.file_url}
                    onChange={e => setForm({ ...form, file_url: e.target.value })}
                    placeholder="https://… (Supabase Storage URL)"
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface"
                  />
                </div>
              )}

              {/* Sort order */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>Sort Order</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface"
                />
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={form.in_stock} onChange={e => setForm({ ...form, in_stock: e.target.checked })} style={{ width: 16, height: 16 }} />
                  In Stock
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} style={{ width: 16, height: 16 }} />
                  Featured on Homepage
                </label>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: 99, border: '1.5px solid #ddd', background: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-on-primary rounded-full font-bold text-sm disabled:opacity-60"
                  style={{ flex: 1, padding: '12px', borderRadius: 99, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
                >
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 400, width: '100%', padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete Product?</h2>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>
              &ldquo;{confirmDelete.name}&rdquo; will be permanently removed. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{ flex: 1, padding: '12px', borderRadius: 99, border: '1.5px solid #ddd', background: 'none', cursor: 'pointer', fontWeight: 700 }}
              >
                Cancel
              </button>
              <button
                onClick={() => del(confirmDelete)}
                style={{ flex: 1, padding: '12px', borderRadius: 99, background: '#b02500', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
