'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';
import FileUpload from '@/components/admin/FileUpload';

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
  delivery_type: 'physical' | 'download' | 'read_online';
  free_resource_url: string | null;
  free_resource_title: string | null;
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
  delivery_type: 'physical' as const,
  free_resource_url: '',
  free_resource_title: '',
};

function key() {
  return typeof window !== 'undefined' ? sessionStorage.getItem('admin_key') || '' : '';
}

function fmt(kobo: number) {
  return '₦' + (kobo / 100).toLocaleString('en-NG');
}

const DELIVERY_LABELS: Record<string, { label: string; cls: string }> = {
  physical: { label: 'Hard Copy', cls: 'bg-tertiary-container/30 text-tertiary' },
  download: { label: 'Digital Download', cls: 'bg-primary-container/30 text-primary' },
  read_online: { label: 'Read Online', cls: 'bg-secondary-container/30 text-secondary' },
};

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [extraImages, setExtraImages] = useState<ProductImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [hasFreeResource, setHasFreeResource] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  useEffect(() => { load(); }, []);

  async function loadExtraImages(productId: string) {
    setImagesLoading(true);
    try {
      const r = await fetch(`/api/admin/product-images?product_id=${productId}`, {
        headers: { 'x-admin-key': key() },
      });
      const d = await r.json();
      setExtraImages(d.images || []);
    } catch { setExtraImages([]); }
    finally { setImagesLoading(false); }
  }

  async function addExtraImage(imageUrl: string) {
    if (!editing) return;
    try {
      await fetch('/api/admin/product-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key() },
        body: JSON.stringify({ product_id: editing.id, image_url: imageUrl, sort_order: extraImages.length }),
      });
      loadExtraImages(editing.id);
    } catch { toast.error('Failed to save image'); }
  }

  async function deleteExtraImage(imageId: string) {
    try {
      await fetch(`/api/admin/product-images/${imageId}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': key() },
      });
      setExtraImages(prev => prev.filter(img => img.id !== imageId));
    } catch { toast.error('Failed to delete image'); }
  }

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/products', { headers: { 'x-admin-key': key() } });
      const d = await r.json();
      setProducts(d.products || []);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditing(null);
    setExtraImages([]);
    setAdditionalImages([]);
    setHasFreeResource(false);
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
      delivery_type: p.delivery_type || 'physical',
      free_resource_url: p.free_resource_url || '',
      free_resource_title: p.free_resource_title || '',
    });
    setHasFreeResource(!!p.free_resource_url);
    setAdditionalImages([]);
    setExtraImages([]);
    loadExtraImages(p.id);
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
        body: JSON.stringify({
          ...form,
          free_resource_url: hasFreeResource ? (form.free_resource_url || null) : null,
          free_resource_title: hasFreeResource ? (form.free_resource_title || null) : null,
        }),
      });
      if (!r.ok) throw new Error();
      const data = await r.json();
      if (!editing && data.product && additionalImages.length > 0) {
        for (let i = 0; i < additionalImages.length; i++) {
          await fetch('/api/admin/product-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': key() },
            body: JSON.stringify({ product_id: data.product.id, image_url: additionalImages[i], sort_order: i }),
          });
        }
      }
      toast.success(editing ? 'Product updated!' : 'Product added!');
      setModal(false);
      load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  }

  async function del(p: Product) {
    try {
      const r = await fetch(`/api/admin/products/${p.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': key() },
      });
      if (!r.ok) throw new Error();
      toast.success('Deleted');
      setConfirmDelete(null);
      load();
    } catch { toast.error('Failed to delete'); }
  }

  const needsFile = form.delivery_type === 'download' || form.delivery_type === 'read_online';

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold font-headline">Products</h1>
        <button
          onClick={openAdd}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-full font-bold text-sm font-headline flex items-center gap-2 hover:scale-105 transition-all"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Product
        </button>
      </div>

      {/* Product list */}
      <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
        {loading && <p className="p-10 text-center text-on-surface-variant">Loading…</p>}

        {!loading && products.length === 0 && (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3 block">inventory_2</span>
            <p className="font-medium mb-4">No products yet</p>
            <button onClick={openAdd} className="bg-primary text-on-primary px-5 py-2.5 rounded-full font-bold text-sm font-headline">
              Add your first product
            </button>
          </div>
        )}

        {!loading && products.length > 0 && products.map((p) => {
          const badge = DELIVERY_LABELS[p.delivery_type] || DELIVERY_LABELS.physical;
          return (
            <div key={p.id} className="flex items-center gap-4 px-5 py-4 border-b border-outline-variant/10 hover:bg-surface-container-low/30 transition-colors">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-2xl">image</span>
                    </div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{p.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badge.cls}`}>
                    {badge.label}
                  </span>
                  <span className="text-xs text-on-surface-variant capitalize">{p.category}</span>
                  <span className="text-sm font-bold text-primary">{fmt(p.price)}</span>
                </div>
              </div>

              {/* Status badges */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                {p.featured && (
                  <span className="bg-primary-container/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold">Featured</span>
                )}
                {!p.in_stock && (
                  <span className="bg-error-container/20 text-error px-2 py-0.5 rounded-full text-xs font-bold">Out of Stock</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(p)}
                  className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant"
                  title="Edit"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                </button>
                <button
                  onClick={() => setConfirmDelete(p)}
                  className="p-2 rounded-lg hover:bg-error-container/20 transition-colors text-error"
                  title="Delete"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 sticky top-0 bg-surface-container-lowest z-10">
              <h2 className="text-xl font-bold font-headline">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-lg hover:bg-surface-container-high">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={save} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-on-surface-variant block mb-1">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface"
                  placeholder="e.g. Creative Arts Studies — Nursery 1"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-on-surface-variant block mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface resize-none"
                  placeholder="Short description shown on product cards"
                />
              </div>

              {/* Price + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-on-surface-variant block mb-1">Price (₦ Naira) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price / 100}
                    onChange={e => setForm({ ...form, price: Math.round(parseFloat(e.target.value || '0') * 100) })}
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface"
                    placeholder="3500"
                  />
                  <p className="text-xs text-on-surface-variant mt-1">Stored in kobo: {form.price}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-on-surface-variant block mb-1">Category *</label>
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

              {/* Delivery Type */}
              <div>
                <label className="text-sm font-medium text-on-surface-variant block mb-1">Delivery Type *</label>
                <select
                  required
                  value={form.delivery_type}
                  onChange={e => setForm({ ...form, delivery_type: e.target.value as typeof form.delivery_type })}
                  className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface"
                >
                  <option value="physical">Physical (Hard Copy — Delivery)</option>
                  <option value="download">Digital (Download — Customer gets a file)</option>
                  <option value="read_online">Digital (Read Online — Embedded viewer, no download)</option>
                </select>
                <p className="text-xs text-on-surface-variant mt-1">
                  {form.delivery_type === 'physical' && 'Customer orders and receives a physical book.'}
                  {form.delivery_type === 'download' && 'Customer pays and downloads the file after payment.'}
                  {form.delivery_type === 'read_online' && 'Customer pays and reads the file in the browser. File is not downloadable.'}
                </p>
              </div>

              {/* Cover Image */}
              <ImageUpload
                value={form.image_url}
                onChange={url => setForm({ ...form, image_url: url })}
                bucket="product-images"
                label="Cover Image"
              />

              {/* Additional Product Images */}
              {editing ? (
                <div className="border border-outline-variant/20 rounded-lg p-4 bg-surface-container-high/20">
                  <p className="text-sm font-medium text-on-surface-variant mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">photo_library</span>
                    Additional Product Images
                  </p>

                  {imagesLoading && (
                    <p className="text-xs text-on-surface-variant mb-3">Loading images…</p>
                  )}

                  {!imagesLoading && extraImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {extraImages.map(img => (
                        <div key={img.id} className="relative w-full aspect-square rounded-lg overflow-hidden">
                          <img
                            src={img.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => deleteExtraImage(img.id)}
                            className="absolute top-1 right-1 bg-error text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:scale-110 transition-transform"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {!imagesLoading && extraImages.length === 0 && (
                    <p className="text-xs text-on-surface-variant mb-3">No additional images yet.</p>
                  )}

                  <ImageUpload
                    value=""
                    onChange={addExtraImage}
                    bucket="product-images"
                    label=""
                  />
                  <p className="text-xs text-on-surface-variant mt-2">
                    Each uploaded image is saved immediately. Click × on a thumbnail to remove it.
                  </p>
                </div>
              ) : (
                <div className="border border-outline-variant/20 rounded-lg p-4 bg-surface-container-high/20">
                  <p className="text-sm font-medium text-on-surface-variant mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">photo_library</span>
                    Additional Product Images
                  </p>

                  {additionalImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {additionalImages.map((url, i) => (
                        <div key={i} className="relative w-full aspect-square rounded-lg overflow-hidden">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setAdditionalImages(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 bg-error text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:scale-110 transition-transform"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <ImageUpload
                    value=""
                    onChange={url => setAdditionalImages(prev => [...prev, url])}
                    bucket="product-images"
                    label=""
                  />
                  <p className="text-xs text-on-surface-variant mt-2">
                    You can add multiple images. Each one appears in the product gallery.
                  </p>
                </div>
              )}

              {/* Digital File Upload — only for download or read_online */}
              {needsFile && (
                <div className="border border-outline-variant/20 rounded-lg p-4 bg-surface-container-high/30">
                  <FileUpload
                    value={form.file_url}
                    onChange={url => setForm({ ...form, file_url: url })}
                    bucket="digital-files"
                    label={
                      form.delivery_type === 'download'
                        ? 'Digital File to Download (PDF, EPUB, etc.)'
                        : 'Digital File to Read Online (PDF)'
                    }
                  />
                  {form.delivery_type === 'read_online' && (
                    <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base text-secondary">lock</span>
                      This file will be embedded in a viewer. Customers cannot download it directly.
                    </p>
                  )}
                </div>
              )}

              {/* Free Resource Section */}
              <div className="border border-outline-variant/20 rounded-lg p-4 bg-surface-container-high/20">
                <label className="flex items-center gap-3 cursor-pointer select-none mb-3">
                  <input
                    type="checkbox"
                    checked={hasFreeResource}
                    onChange={e => setHasFreeResource(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-secondary">card_giftcard</span>
                    Include a free downloadable resource with this product
                  </span>
                </label>

                {hasFreeResource && (
                  <div className="space-y-3 pt-1">
                    <FileUpload
                      value={form.free_resource_url}
                      onChange={url => setForm({ ...form, free_resource_url: url })}
                      bucket="digital-files"
                      label="Free Resource File"
                    />
                    <div>
                      <label className="text-sm font-medium text-on-surface-variant block mb-1">Resource Title</label>
                      <input
                        type="text"
                        value={form.free_resource_title}
                        onChange={e => setForm({ ...form, free_resource_title: e.target.value })}
                        placeholder="e.g. Free Sample Chapter"
                        className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sort order + toggles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-on-surface-variant block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface"
                  />
                </div>
                <div className="flex flex-col gap-3 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.in_stock}
                      onChange={e => setForm({ ...form, in_stock: e.target.checked })}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm font-medium">In Stock / Active</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={e => setForm({ ...form, featured: e.target.checked })}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm font-medium">Featured on homepage</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 py-3 rounded-full border border-outline-variant text-sm font-bold font-headline hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-full bg-primary text-on-primary text-sm font-bold font-headline disabled:opacity-60"
                >
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold font-headline mb-2">Delete Product?</h2>
            <p className="text-on-surface-variant text-sm mb-6">
              &ldquo;{confirmDelete.name}&rdquo; will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-full border border-outline-variant text-sm font-bold font-headline hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => del(confirmDelete)}
                className="flex-1 py-3 rounded-full bg-error text-on-error text-sm font-bold font-headline"
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
