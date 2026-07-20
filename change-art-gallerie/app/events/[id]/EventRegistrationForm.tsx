'use client';

import { useState } from 'react';
import { fbq } from '@/lib/pixel';

interface Props {
  eventId: string;
  eventTitle?: string;
  registrationOpen: boolean;
  whatsappLink?: string | null;
  whatsappNumber?: string | null;
}

interface RegForm {
  full_name: string;
  phone: string;
  location: string;
  email: string;
}

const BLANK: RegForm = { full_name: '', phone: '', location: '', email: '' };

export default function EventRegistrationForm({ eventId, eventTitle, registrationOpen, whatsappLink, whatsappNumber }: Props) {
  const [form, setForm] = useState<RegForm>(BLANK);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const waUrl = whatsappLink || (whatsappNumber ? `https://wa.me/${whatsappNumber}` : null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const r = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, ...form }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || 'Registration failed'); return; }
      setSuccess(true);
      fbq('track', 'CompleteRegistration', { content_name: eventTitle || 'Event Registration' });
      const link = data.whatsapp_link || (data.whatsapp_number ? `https://wa.me/${data.whatsapp_number}` : null);
      if (link) window.open(link, '_blank');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (!registrationOpen) {
    return (
      <div className="bg-surface-container-high rounded-xl p-6 text-center">
        <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2 block">event_busy</span>
        <p className="font-bold font-headline">Registration Closed</p>
        <p className="text-on-surface-variant text-sm mt-1">Registration for this event is currently closed.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-50 rounded-xl p-6 text-center border border-green-200">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
        </div>
        <h3 className="font-bold font-headline text-lg mb-2">You're registered! 🎉</h3>
        <p className="text-on-surface-variant text-sm mb-5">
          Your registration has been received. Join our WhatsApp group to stay updated on event details.
        </p>
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold font-headline hover:scale-105 transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Join WhatsApp Group
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5">Full Name *</label>
        <input
          type="text"
          required
          value={form.full_name}
          onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
          placeholder="Your full name"
          className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Phone Number *</label>
        <input
          type="tel"
          required
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          placeholder="08012345678"
          className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Your City / Location</label>
        <input
          type="text"
          value={form.location}
          onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
          placeholder="e.g. Port Harcourt, Lagos"
          className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Email (optional)</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="you@example.com"
          className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
        />
      </div>
      {error && (
        <p className="text-sm text-error bg-error-container/20 px-3 py-2.5 rounded-lg">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#25D366] text-white py-3.5 rounded-full font-bold font-headline flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:scale-100"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        {submitting ? 'Registering…' : 'Register & Join WhatsApp'}
      </button>
    </form>
  );
}
