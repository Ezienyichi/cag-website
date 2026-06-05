'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface FAQ { id: string; question: string; answer: string; sort_order: number; }

const BLANK = { question: '', answer: '', sort_order: 0 };

function key() { return typeof window !== 'undefined' ? sessionStorage.getItem('admin_key') || '' : ''; }

export default function FAQsAdminPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/faqs', { headers: { 'x-admin-key': key() } });
      const d = await r.json();
      setFaqs(d.faqs || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }

  function openAdd() { setEditing(null); setForm({ ...BLANK, sort_order: faqs.length }); setModal(true); }
  function openEdit(f: FAQ) { setEditing(f); setForm({ question: f.question, answer: f.answer, sort_order: f.sort_order }); setModal(true); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/admin/faqs/${editing.id}` : '/api/admin/faqs';
      const r = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key() },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      toast.success(editing ? 'FAQ updated!' : 'FAQ added!');
      setModal(false);
      load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  }

  async function del(f: FAQ) {
    try {
      const r = await fetch(`/api/admin/faqs/${f.id}`, { method: 'DELETE', headers: { 'x-admin-key': key() } });
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
          <h1 className="text-2xl font-bold font-headline">FAQs</h1>
          <p className="text-on-surface-variant text-sm mt-1">These appear on the waitlist page, ordered by Sort Order.</p>
        </div>
        <button onClick={openAdd} className="bg-primary text-on-primary px-5 py-2.5 rounded-full font-bold text-sm font-headline">+ Add FAQ</button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
        {loading && <p className="p-8 text-center text-on-surface-variant">Loading…</p>}
        {!loading && faqs.length === 0 && (
          <div className="p-12 text-center text-on-surface-variant">
            <p className="font-bold mb-4">No FAQs yet</p>
            <button onClick={openAdd} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm">Add First FAQ</button>
          </div>
        )}
        {!loading && faqs.map((f, i) => (
          <div key={f.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f0e6c8', color: '#7b5400', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{f.question}</p>
              <p style={{ fontSize: 13, color: '#666', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{f.answer}</p>
            </div>
            <button onClick={() => openEdit(f)} className="px-4 py-2 rounded-lg bg-surface-container-high text-sm font-medium" style={{ marginRight: 8 }}>Edit</button>
            <button onClick={() => setDeleteTarget(f)} className="px-4 py-2 rounded-lg text-sm font-medium text-error hover:bg-error-container/20">Delete</button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: '#fff' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>{editing ? 'Edit FAQ' : 'Add FAQ'}</h2>
              <button onClick={() => setModal(false)} style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={save} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>Question *</label>
                <input required value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} placeholder="e.g. Where is your office located?" className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>Answer *</label>
                <textarea required value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} rows={5} placeholder="Type the full answer here…" className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm resize-none" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm" />
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="button" onClick={() => setModal(false)} style={{ flex: 1, padding: 12, borderRadius: 99, border: '1.5px solid #ddd', background: 'none', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
                <button type="submit" disabled={saving} className="bg-primary text-on-primary font-bold disabled:opacity-60" style={{ flex: 1, padding: 12, borderRadius: 99, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add FAQ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 360, width: '100%', padding: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Delete FAQ?</h2>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>&ldquo;{deleteTarget.question}&rdquo; will be permanently removed.</p>
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
