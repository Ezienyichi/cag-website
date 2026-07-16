'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

interface CEvent {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  event_date: string | null;
  event_time: string | null;
  end_date: string | null;
  end_time: string | null;
  location: string | null;
  location_url: string | null;
  flyer_url: string | null;
  additional_images: string[] | null;
  whatsapp_link: string | null;
  whatsapp_number: string | null;
  registration_open: boolean;
  visible: boolean;
  featured: boolean;
  event_type: string;
  price: number;
  max_attendees: number | null;
  sort_order: number;
  created_at: string;
  event_registrations?: Array<{ count: number }>;
}

interface Registration {
  id: string;
  event_id: string;
  full_name: string;
  phone: string;
  location: string | null;
  email: string | null;
  registered_at: string;
}

type FormData = Omit<CEvent, 'id' | 'created_at' | 'event_registrations'>;

const BLANK: FormData = {
  title: '',
  description: null,
  short_description: null,
  event_date: null,
  event_time: null,
  end_date: null,
  end_time: null,
  location: null,
  location_url: null,
  flyer_url: null,
  additional_images: [],
  whatsapp_link: null,
  whatsapp_number: null,
  registration_open: true,
  visible: true,
  featured: false,
  event_type: 'training',
  price: 0,
  max_attendees: null,
  sort_order: 0,
};

const EVENT_TYPES = [
  { value: 'training', label: 'Training' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'exhibition', label: 'Exhibition' },
  { value: 'conference', label: 'Conference' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'other', label: 'Other' },
];

const TYPE_COLORS: Record<string, string> = {
  training: 'bg-primary-container/30 text-primary',
  workshop: 'bg-secondary-container/30 text-secondary',
  exhibition: 'bg-tertiary-container/30 text-tertiary',
  conference: 'bg-primary-container text-on-primary-container',
  meetup: 'bg-secondary-container text-on-secondary-container',
  other: 'bg-surface-container text-on-surface-variant',
};

function adminKey() {
  return typeof window !== 'undefined' ? sessionStorage.getItem('admin_key') || '' : '';
}

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d + 'T00:00:00').toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

const INPUT = 'w-full px-4 py-2.5 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-on-surface">{label}</label>
      {children}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">{label}</p>
      <div className="bg-surface-container-high/30 rounded-xl p-4 space-y-4 border border-outline-variant/10">
        {children}
      </div>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-primary' : 'bg-outline-variant'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<CEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CEvent | null>(null);
  const [form, setForm] = useState<FormData>(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [regModal, setRegModal] = useState<{ event: CEvent; regs: Registration[]; total: number } | null>(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regSearch, setRegSearch] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/events', { headers: { 'x-admin-key': adminKey() } });
      const d = await r.json();
      setEvents(d.events || []);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({ ...BLANK, sort_order: events.length });
    setModalOpen(true);
  }

  function openEdit(ev: CEvent) {
    setEditing(ev);
    setForm({
      title: ev.title,
      description: ev.description,
      short_description: ev.short_description,
      event_date: ev.event_date,
      event_time: ev.event_time,
      end_date: ev.end_date,
      end_time: ev.end_time,
      location: ev.location,
      location_url: ev.location_url,
      flyer_url: ev.flyer_url,
      additional_images: ev.additional_images || [],
      whatsapp_link: ev.whatsapp_link,
      whatsapp_number: ev.whatsapp_number,
      registration_open: ev.registration_open,
      visible: ev.visible,
      featured: ev.featured,
      event_type: ev.event_type,
      price: ev.price,
      max_attendees: ev.max_attendees,
      sort_order: ev.sort_order,
    });
    setModalOpen(true);
  }

  function setF(patch: Partial<FormData>) {
    setForm(f => ({ ...f, ...patch }));
  }

  async function save() {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/events/${editing.id}` : '/api/admin/events';
      const method = editing ? 'PATCH' : 'POST';
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey() },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) { toast.error(data.error || `Save failed (${r.status})`); return; }
      toast.success(editing ? 'Event updated' : 'Event created');
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(id: string) {
    try {
      const r = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey() },
      });
      if (!r.ok) { toast.error('Delete failed'); return; }
      toast.success('Event deleted');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Delete failed');
    }
  }

  async function openRegistrations(ev: CEvent) {
    setRegLoading(true);
    setRegSearch('');
    setRegModal({ event: ev, regs: [], total: 0 });
    try {
      const r = await fetch(`/api/admin/events/${ev.id}/registrations`, {
        headers: { 'x-admin-key': adminKey() },
      });
      const d = await r.json();
      setRegModal({ event: ev, regs: d.registrations || [], total: d.total || 0 });
    } catch {
      toast.error('Failed to load registrations');
      setRegModal(null);
    } finally {
      setRegLoading(false);
    }
  }

  function exportCSV(regs: Registration[], title: string) {
    const rows = [
      ['Full Name', 'Phone', 'Location', 'Email', 'Registered At'],
      ...regs.map(r => [
        r.full_name,
        r.phone,
        r.location || '',
        r.email || '',
        new Date(r.registered_at).toLocaleString('en-NG'),
      ]),
    ];
    const csv = rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredRegs = (regModal?.regs || []).filter(r =>
    r.full_name.toLowerCase().includes(regSearch.toLowerCase()) ||
    r.phone.includes(regSearch)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-headline">Events</h1>
          <p className="text-on-surface-variant text-sm mt-1">{events.length} event{events.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-primary-container text-on-primary-container px-5 py-2.5 rounded-full font-bold font-headline flex items-center gap-2 hover:scale-105 transition-all"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Event
        </button>
      </div>

      {loading && (
        <div className="text-center py-20 text-on-surface-variant">Loading events…</div>
      )}

      {!loading && events.length === 0 && (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-3 block">event</span>
          <p className="font-medium">No events yet. Create your first event.</p>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="space-y-4">
          {events.map(ev => {
            const regCount = ev.event_registrations?.[0]?.count ?? 0;
            return (
              <div key={ev.id} className="bg-surface-container-lowest rounded-xl p-4 ambient-shadow flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-20 h-24 sm:h-20 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
                  {ev.flyer_url ? (
                    <img src={ev.flyer_url} alt={ev.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-on-surface-variant/40">event</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="font-bold font-headline text-base">{ev.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold font-headline capitalize ${TYPE_COLORS[ev.event_type] || TYPE_COLORS.other}`}>
                      {ev.event_type}
                    </span>
                    {ev.featured && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-tertiary-container/30 text-tertiary">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant mb-2">
                    {ev.event_date && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        {formatDate(ev.event_date)}{ev.event_time ? ` · ${ev.event_time}` : ''}
                      </span>
                    )}
                    {ev.location && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {ev.location}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ev.visible ? 'bg-green-100 text-green-700' : 'bg-surface-container text-on-surface-variant'}`}>
                      {ev.visible ? 'Visible' : 'Hidden'}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ev.registration_open ? 'bg-primary-container/30 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                      {ev.registration_open ? 'Reg. Open' : 'Reg. Closed'}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-surface-container text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">people</span>
                      {regCount} registered
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 items-center sm:items-end justify-end shrink-0">
                  <button
                    onClick={() => openRegistrations(ev)}
                    className="text-xs bg-surface-container-high px-3 py-1.5 rounded-full font-medium hover:bg-surface-container transition-colors flex items-center gap-1 whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-sm">how_to_reg</span>
                    Registrations
                  </button>
                  <button
                    onClick={() => openEdit(ev)}
                    className="text-xs bg-primary-container/20 text-primary px-3 py-1.5 rounded-full font-medium hover:bg-primary-container/30 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(ev.id)}
                    className="text-xs bg-error-container/20 text-error px-3 py-1.5 rounded-full font-medium hover:bg-error-container/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-2xl ambient-shadow mb-8">
            <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant/10 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-bold font-headline">{editing ? 'Edit Event' : 'Add Event'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <Section label="Event Details">
                <Field label="Title *">
                  <input
                    value={form.title}
                    onChange={e => setF({ title: e.target.value })}
                    placeholder="Event title"
                    className={INPUT}
                  />
                </Field>
                <Field label="Short Description">
                  <input
                    value={form.short_description || ''}
                    onChange={e => setF({ short_description: e.target.value || null })}
                    placeholder="One-line preview for cards"
                    className={INPUT}
                  />
                </Field>
                <Field label="Full Description">
                  <textarea
                    value={form.description || ''}
                    onChange={e => setF({ description: e.target.value || null })}
                    placeholder="Full event description…"
                    rows={4}
                    className={INPUT + ' resize-none'}
                  />
                </Field>
                <Field label="Event Type">
                  <select
                    value={form.event_type}
                    onChange={e => setF({ event_type: e.target.value })}
                    className={INPUT}
                  >
                    {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
              </Section>

              <Section label="Date & Time">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start Date">
                    <input
                      type="date"
                      value={form.event_date || ''}
                      onChange={e => setF({ event_date: e.target.value || null })}
                      className={INPUT}
                    />
                  </Field>
                  <Field label="Start Time">
                    <input
                      value={form.event_time || ''}
                      onChange={e => setF({ event_time: e.target.value || null })}
                      placeholder="10:00 AM"
                      className={INPUT}
                    />
                  </Field>
                  <Field label="End Date (optional)">
                    <input
                      type="date"
                      value={form.end_date || ''}
                      onChange={e => setF({ end_date: e.target.value || null })}
                      className={INPUT}
                    />
                  </Field>
                  <Field label="End Time (optional)">
                    <input
                      value={form.end_time || ''}
                      onChange={e => setF({ end_time: e.target.value || null })}
                      placeholder="4:00 PM"
                      className={INPUT}
                    />
                  </Field>
                </div>
              </Section>

              <Section label="Location">
                <Field label="Location">
                  <input
                    value={form.location || ''}
                    onChange={e => setF({ location: e.target.value || null })}
                    placeholder="e.g. Port Harcourt, Rivers State"
                    className={INPUT}
                  />
                </Field>
                <Field label="Location URL (Google Maps)">
                  <input
                    value={form.location_url || ''}
                    onChange={e => setF({ location_url: e.target.value || null })}
                    placeholder="https://maps.google.com/..."
                    className={INPUT}
                  />
                </Field>
              </Section>

              <Section label="Media">
                <ImageUpload
                  value={form.flyer_url || undefined}
                  onChange={url => setF({ flyer_url: url })}
                  bucket="product-images"
                  label="Event Flyer"
                />
                <div>
                  <p className="text-sm font-medium mb-2">Additional Images</p>
                  {(form.additional_images || []).length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {(form.additional_images || []).map((img, i) => (
                        <div key={i} className="relative group">
                          <img src={img} alt="" className="w-full h-20 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => setF({ additional_images: (form.additional_images || []).filter((_, j) => j !== i) })}
                            className="absolute top-1 right-1 bg-error text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <ImageUpload
                    onChange={url => setF({ additional_images: [...(form.additional_images || []), url] })}
                    bucket="product-images"
                    label="Add Image"
                  />
                </div>
              </Section>

              <Section label="Registration & WhatsApp">
                <Field label="WhatsApp Group Link">
                  <input
                    value={form.whatsapp_link || ''}
                    onChange={e => setF({ whatsapp_link: e.target.value || null })}
                    placeholder="https://chat.whatsapp.com/xxx"
                    className={INPUT}
                  />
                </Field>
                <Field label="WhatsApp Number (with country code)">
                  <input
                    value={form.whatsapp_number || ''}
                    onChange={e => setF({ whatsapp_number: e.target.value || null })}
                    placeholder="2348012345678"
                    className={INPUT}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Max Attendees (0 = unlimited)">
                    <input
                      type="number"
                      min="0"
                      value={form.max_attendees ?? ''}
                      onChange={e => setF({ max_attendees: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="0"
                      className={INPUT}
                    />
                  </Field>
                  <Field label="Price in Naira (0 = free)">
                    <input
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={e => setF({ price: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className={INPUT}
                    />
                  </Field>
                </div>
              </Section>

              <Section label="Visibility Controls">
                <Toggle
                  label="Visible on website"
                  description="Show this event on the public events page"
                  checked={form.visible}
                  onChange={v => setF({ visible: v })}
                />
                <Toggle
                  label="Registration open"
                  description="Allow people to register for this event"
                  checked={form.registration_open}
                  onChange={v => setF({ registration_open: v })}
                />
                <Toggle
                  label="Featured event"
                  description="Show prominently on homepage and events page"
                  checked={form.featured}
                  onChange={v => setF({ featured: v })}
                />
              </Section>
            </div>

            <div className="sticky bottom-0 bg-surface-container-lowest border-t border-outline-variant/10 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full font-bold font-headline disabled:opacity-60 hover:scale-105 transition-all"
              >
                {saving ? 'Saving…' : editing ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full ambient-shadow">
            <div className="w-12 h-12 bg-error-container/20 rounded-xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl text-error">warning</span>
            </div>
            <h3 className="text-lg font-bold font-headline mb-2">Delete Event?</h3>
            <p className="text-on-surface-variant text-sm mb-6">
              This will permanently delete the event and all its registrations. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteEvent(deleteId)}
                className="bg-error text-white px-5 py-2 rounded-full font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registrations Modal */}
      {regModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-3xl ambient-shadow mb-8">
            <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant/10 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h2 className="font-bold font-headline text-base">{regModal.event.title}</h2>
                <p className="text-sm text-on-surface-variant">
                  {regModal.total} registration{regModal.total !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportCSV(regModal.regs, regModal.event.title)}
                  disabled={regModal.regs.length === 0}
                  className="bg-surface-container-high px-4 py-2 rounded-full text-sm font-medium font-headline flex items-center gap-1.5 hover:bg-surface-container transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  Export CSV
                </button>
                <button onClick={() => setRegModal(null)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <input
                value={regSearch}
                onChange={e => setRegSearch(e.target.value)}
                placeholder="Search by name or phone…"
                className={INPUT + ' w-full mb-5'}
              />

              {regLoading && (
                <p className="text-center text-on-surface-variant py-12">Loading registrations…</p>
              )}

              {!regLoading && filteredRegs.length === 0 && (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 block">people</span>
                  <p>{regSearch ? 'No matches found.' : 'No registrations yet.'}</p>
                </div>
              )}

              {!regLoading && filteredRegs.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="border-b border-outline-variant/20">
                        <th className="text-left pb-3 text-on-surface-variant font-medium pr-4">Name</th>
                        <th className="text-left pb-3 text-on-surface-variant font-medium pr-4">Phone</th>
                        <th className="text-left pb-3 text-on-surface-variant font-medium pr-4">Location</th>
                        <th className="text-left pb-3 text-on-surface-variant font-medium pr-4">Email</th>
                        <th className="text-left pb-3 text-on-surface-variant font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegs.map((r, i) => (
                        <tr
                          key={r.id}
                          className={`border-b border-outline-variant/5 ${i % 2 === 0 ? '' : 'bg-surface-container/20'}`}
                        >
                          <td className="py-3 font-medium pr-4">{r.full_name}</td>
                          <td className="py-3 text-on-surface-variant pr-4">{r.phone}</td>
                          <td className="py-3 text-on-surface-variant pr-4">{r.location || '—'}</td>
                          <td className="py-3 text-on-surface-variant pr-4">{r.email || '—'}</td>
                          <td className="py-3 text-on-surface-variant whitespace-nowrap">
                            {new Date(r.registered_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
