'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import ImageUpload from '@/components/admin/ImageUpload';

interface BookPage {
  id: string;
  book_level: string;
  image_url: string;
  sort_order: number;
}

const LEVELS = [
  { key: 'nursery1', label: 'Nursery 1' },
  { key: 'nursery2', label: 'Nursery 2' },
  { key: 'nursery3', label: 'Nursery 3' },
];

function adminKey() {
  return sessionStorage.getItem('admin_key') || '';
}

export default function AdminBooksPage() {
  const [activeTab, setActiveTab] = useState('nursery1');
  const [pages, setPages] = useState<BookPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function fetchPages() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/books?level=${activeTab}`, {
        headers: { 'x-admin-key': adminKey() },
      });
      const data = await res.json();
      setPages(data.pages || []);
    } catch {
      toast.error('Failed to load book pages');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPage() {
    if (!newImageUrl) {
      toast.error('Please choose an image first');
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey(),
        },
        body: JSON.stringify({
          book_level: activeTab,
          image_url: newImageUrl,
          sort_order: pages.length,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success('Page added');
      setNewImageUrl('');
      fetchPages();
    } catch {
      toast.error('Failed to add page');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/books/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey() },
      });
      if (!res.ok) throw new Error();
      toast.success('Page deleted');
      setDeleteId(null);
      fetchPages();
    } catch {
      toast.error('Failed to delete page');
    }
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const reordered = [...pages];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    await saveOrder(reordered);
  }

  async function handleMoveDown(index: number) {
    if (index === pages.length - 1) return;
    const reordered = [...pages];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    await saveOrder(reordered);
  }

  async function saveOrder(reordered: BookPage[]) {
    setPages(reordered);
    try {
      await fetch('/api/admin/books/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey(),
        },
        body: JSON.stringify({ ids: reordered.map((p) => p.id) }),
      });
      toast.success('Order saved');
    } catch {
      toast.error('Failed to save order');
      fetchPages();
    }
  }

  const tabLabel = LEVELS.find((l) => l.key === activeTab)?.label || '';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-headline mb-2">Book Pages</h1>
        <p className="text-on-surface-variant text-sm">
          Manage preview images for each nursery level. These appear in the BookCarousel on the waitlist page.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {LEVELS.map((l) => (
          <button
            key={l.key}
            onClick={() => setActiveTab(l.key)}
            className={`px-5 py-2.5 rounded-full font-bold font-headline text-sm transition-all ${
              activeTab === l.key
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Upload panel */}
        <div className="bg-surface-container-lowest rounded-xl p-5 ambient-shadow">
          <h2 className="font-bold font-headline mb-4">Add Page — {tabLabel}</h2>
          <ImageUpload
            value={newImageUrl}
            onChange={setNewImageUrl}
            bucket="book-pages"
            label="Page Image"
          />
          <button
            onClick={handleAddPage}
            disabled={uploading || !newImageUrl}
            className="w-full mt-4 py-3 rounded-full bg-primary text-on-primary font-bold font-headline text-sm disabled:opacity-60"
          >
            {uploading ? 'Adding…' : 'Add Page'}
          </button>
        </div>

        {/* Pages grid */}
        <div className="md:col-span-2">
          <div className="bg-surface-container-lowest rounded-xl p-5 ambient-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold font-headline">{tabLabel} — {pages.length} pages</h2>
              <p className="text-xs text-on-surface-variant">Use arrows to reorder</p>
            </div>

            {loading ? (
              <p className="text-on-surface-variant text-sm text-center py-8">Loading…</p>
            ) : pages.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block">photo_library</span>
                <p className="text-sm">No pages yet. Upload your first page.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pages.map((page, i) => (
                  <div key={page.id} className="relative group rounded-lg overflow-hidden bg-surface-container-high aspect-[3/4]">
                    <Image
                      src={page.image_url}
                      alt={`Page ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                    {/* Overlay controls */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      <p className="text-white text-xs font-bold">Page {i + 1}</p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleMoveUp(i)}
                          disabled={i === 0}
                          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/40 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">arrow_upward</span>
                        </button>
                        <button
                          onClick={() => handleMoveDown(i)}
                          disabled={i === pages.length - 1}
                          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/40 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">arrow_downward</span>
                        </button>
                        <button
                          onClick={() => setDeleteId(page.id)}
                          className="w-8 h-8 bg-error/80 rounded-full flex items-center justify-center text-white hover:bg-error transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-sm w-full p-6 ambient-shadow">
            <h2 className="text-lg font-bold font-headline mb-2">Delete Page?</h2>
            <p className="text-on-surface-variant text-sm mb-6">This image will be removed from the carousel.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-full border border-outline-variant text-sm font-bold font-headline"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
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
