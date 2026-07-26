'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';
import { fbq } from '@/lib/pixel';
import { getRecaptchaToken } from '@/components/useRecaptcha';

interface PublicEvent {
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
  whatsapp_link: string | null;
  whatsapp_number: string | null;
  registration_open: boolean;
  featured: boolean;
  event_type: string;
  price: number;
  max_attendees: number | null;
}

const TYPE_STYLES: Record<string, string> = {
  training: 'bg-primary-container/30 text-primary',
  workshop: 'bg-secondary-container/30 text-secondary',
  exhibition: 'bg-tertiary-container/30 text-tertiary',
  conference: 'bg-primary-container text-on-primary-container',
  meetup: 'bg-secondary-container text-on-secondary-container',
  other: 'bg-surface-container text-on-surface-variant',
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatPrice(p: number) {
  if (p === 0) return 'Free';
  return '₦' + p.toLocaleString('en-NG');
}

function isUpcoming(event: PublicEvent) {
  if (!event.event_date) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(event.event_date + 'T00:00:00') >= today;
}

interface RegForm {
  full_name: string;
  phone: string;
  location: string;
  email: string;
}

const BLANK_REG: RegForm = { full_name: '', phone: '', location: '', email: '' };

export default function EventsPage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);

  const [regEvent, setRegEvent] = useState<PublicEvent | null>(null);
  const [regForm, setRegForm] = useState<RegForm>(BLANK_REG);
  const [submitting, setSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState<{ whatsapp_link: string | null; whatsapp_number: string | null } | null>(null);
  const [regError, setRegError] = useState('');
  const [regHoneypot, setRegHoneypot] = useState('');
  const [regOpenTime, setRegOpenTime] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createBrowserClient();
        const { data } = await supabase
          .from('events')
          .select('*')
          .eq('visible', true)
          .order('event_date', { ascending: true });
        setEvents((data as PublicEvent[]) || []);
      } catch {
        /* no-op */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const featured = events.find(e => e.featured && isUpcoming(e)) || null;
  const upcoming = events.filter(e => isUpcoming(e) && !e.featured);
  const past = events.filter(e => !isUpcoming(e));

  function openReg(ev: PublicEvent) {
    setRegEvent(ev);
    setRegForm(BLANK_REG);
    setRegSuccess(null);
    setRegError('');
    setRegHoneypot('');
    setRegOpenTime(Date.now());
  }

  async function submitReg(e: React.FormEvent) {
    e.preventDefault();
    if (!regEvent) return;

    // Honeypot check
    if (regHoneypot) {
      setRegSuccess({ whatsapp_link: null, whatsapp_number: null });
      return;
    }

    // Time check — real users take more than 3 seconds
    if (Date.now() - regOpenTime < 3000) {
      setRegSuccess({ whatsapp_link: null, whatsapp_number: null });
      return;
    }

    setSubmitting(true);
    setRegError('');
    try {
      const recaptchaToken = await getRecaptchaToken('event_register');
      const r = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: regEvent.id, ...regForm, website: regHoneypot, recaptchaToken }),
      });
      const data = await r.json();
      if (!r.ok) { setRegError(data.error || 'Registration failed'); return; }
      setRegSuccess({ whatsapp_link: data.whatsapp_link, whatsapp_number: data.whatsapp_number });
      fbq('track', 'CompleteRegistration', { content_name: regEvent.title });
      const waLink = data.whatsapp_link || (data.whatsapp_number ? `https://wa.me/${data.whatsapp_number}` : null);
      if (waLink) window.open(waLink, '_blank');
    } catch (err: any) {
      setRegError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  function closeReg() {
    setRegEvent(null);
    setRegSuccess(null);
    setRegError('');
  }

  const waUrl = regSuccess
    ? (regSuccess.whatsapp_link || (regSuccess.whatsapp_number ? `https://wa.me/${regSuccess.whatsapp_number}` : null))
    : null;

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 min-h-screen">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary-container/20 to-surface px-6 md:px-8 py-16">
          <div className="max-w-screen-xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-container/30 text-primary px-4 py-1.5 rounded-full text-sm font-bold font-headline mb-5">
              <span className="material-symbols-outlined text-base">event</span>
              Events & Trainings
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 max-w-2xl leading-tight">
              Learn, Create & Connect
            </h1>
            <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
              Join our workshops, trainings, and exhibitions. Learn creative arts education techniques and connect with educators across Nigeria.
            </p>
          </div>
        </div>

        <div className="px-6 md:px-8 max-w-screen-xl mx-auto mt-12">
          {loading && (
            <div className="text-center py-20 text-on-surface-variant">Loading events…</div>
          )}

          {!loading && events.length === 0 && (
            <div className="text-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-3 block">event_busy</span>
              <p className="font-medium">No upcoming events. Check back soon!</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Featured Event */}
              {featured && (
                <div className="mb-14">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary">star</span>
                    Featured Event
                  </p>
                  <div className="bg-surface-container-lowest rounded-2xl overflow-hidden ambient-shadow">
                    <div className="grid md:grid-cols-2">
                      <div className="aspect-[3/4] md:aspect-auto md:min-h-[400px] relative">
                        {featured.flyer_url ? (
                          <img src={featured.flyer_url} alt={featured.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">event</span>
                          </div>
                        )}
                        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold font-headline capitalize ${TYPE_STYLES[featured.event_type] || TYPE_STYLES.other}`}>
                          {capitalize(featured.event_type)}
                        </div>
                      </div>
                      <div className="p-8 flex flex-col justify-center">
                        <h2 className="text-2xl font-bold font-headline mb-3">{featured.title}</h2>
                        {featured.short_description && (
                          <p className="text-on-surface-variant mb-5">{featured.short_description}</p>
                        )}
                        <div className="space-y-2 mb-6">
                          {featured.event_date && (
                            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                              <span className="material-symbols-outlined text-base text-primary">calendar_today</span>
                              {formatDate(featured.event_date)}{featured.event_time ? ` · ${featured.event_time}` : ''}
                            </div>
                          )}
                          {featured.location && (
                            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                              <span className="material-symbols-outlined text-base text-primary">location_on</span>
                              {featured.location}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm font-bold text-primary">
                            <span className="material-symbols-outlined text-base">payments</span>
                            {formatPrice(featured.price)}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={`/events/${featured.id}`}
                            className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-bold font-headline hover:scale-105 transition-all"
                          >
                            Learn More
                          </Link>
                          {featured.registration_open ? (
                            <button
                              onClick={() => openReg(featured)}
                              className="bg-[#25D366] text-white px-6 py-3 rounded-full font-bold font-headline hover:scale-105 transition-all flex items-center gap-2"
                            >
                              Register Now
                            </button>
                          ) : (
                            <span className="px-5 py-3 rounded-full text-sm font-medium bg-surface-container text-on-surface-variant">
                              Registration Closed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Events */}
              {upcoming.length > 0 && (
                <div className="mb-14">
                  <h2 className="text-xl font-bold font-headline mb-6">Upcoming Events</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcoming.map(ev => (
                      <EventCard key={ev.id} ev={ev} onRegister={() => openReg(ev)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Past Events */}
              {past.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowPast(!showPast)}
                    className="flex items-center gap-2 text-on-surface-variant font-medium text-sm mb-5 hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">{showPast ? 'expand_less' : 'expand_more'}</span>
                    {showPast ? 'Hide' : 'View'} Past Events ({past.length})
                  </button>
                  {showPast && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                      {past.map(ev => (
                        <div key={ev.id} className="relative">
                          <EventCard ev={ev} onRegister={() => {}} past />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Registration Modal */}
      {regEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg ambient-shadow mb-8">
            {/* Event preview */}
            <div className="relative h-40 overflow-hidden rounded-t-2xl bg-surface-container-high">
              {regEvent.flyer_url ? (
                <img src={regEvent.flyer_url} alt={regEvent.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">event</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
                <h2 className="text-white font-bold font-headline text-lg">{regEvent.title}</h2>
              </div>
              <button
                onClick={closeReg}
                className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="p-6">
              {regSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
                  </div>
                  <h3 className="text-xl font-bold font-headline mb-2">You're registered! 🎉</h3>
                  <p className="text-on-surface-variant text-sm mb-6">
                    Your registration has been received. Join the WhatsApp group to stay updated.
                  </p>
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] text-white py-3 rounded-full font-bold font-headline flex items-center justify-center gap-2 hover:scale-[1.02] transition-all mb-3"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Join WhatsApp Group
                    </a>
                  )}
                  <button
                    onClick={closeReg}
                    className="w-full py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors font-medium text-sm"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={submitReg} className="space-y-4">
                  <div>
                    <h3 className="font-bold font-headline text-base mb-1">Register for this event</h3>
                    <p className="text-on-surface-variant text-xs">After registering, you'll be directed to our WhatsApp group.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={regForm.full_name}
                      onChange={e => setRegForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={regForm.phone}
                      onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="08012345678"
                      className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Your City / Location</label>
                    <input
                      type="text"
                      value={regForm.location}
                      onChange={e => setRegForm(f => ({ ...f, location: e.target.value }))}
                      placeholder="e.g. Port Harcourt, Lagos"
                      className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email (optional)</label>
                    <input
                      type="email"
                      value={regForm.email}
                      onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                    />
                  </div>

                  {/* Honeypot — invisible to humans, bots fill it */}
                  <input
                    type="text"
                    name="website"
                    value={regHoneypot}
                    onChange={e => setRegHoneypot(e.target.value)}
                    style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  {regError && (
                    <p className="text-sm text-error bg-error-container/20 px-3 py-2.5 rounded-lg">{regError}</p>
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
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

function EventCard({ ev, onRegister, past }: { ev: PublicEvent; onRegister: () => void; past?: boolean }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow flex flex-col">
      <div className="aspect-[3/4] relative bg-surface-container-high overflow-hidden">
        {ev.flyer_url ? (
          <img src={ev.flyer_url} alt={ev.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">event</span>
          </div>
        )}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold font-headline capitalize ${TYPE_STYLES[ev.event_type] || TYPE_STYLES.other}`}>
          {capitalize(ev.event_type)}
        </div>
        {past && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-black/40 text-white">
            Event Ended
          </div>
        )}
        {!past && ev.price === 0 && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-tertiary-container text-on-tertiary-container">
            Free
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold font-headline text-base mb-3 leading-snug">{ev.title}</h3>
        <div className="space-y-1.5 mb-4 flex-1">
          {ev.event_date && (
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm text-primary">calendar_today</span>
              {formatDate(ev.event_date)}{ev.event_time ? ` · ${ev.event_time}` : ''}
            </div>
          )}
          {ev.location && (
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm text-primary">location_on</span>
              {ev.location}
            </div>
          )}
          {ev.price > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <span className="material-symbols-outlined text-sm">payments</span>
              {formatPrice(ev.price)}
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/events/${ev.id}`}
            className="flex-1 text-center py-2.5 rounded-full text-sm font-bold font-headline bg-surface-container-high hover:bg-surface-container transition-colors"
          >
            Details
          </Link>
          {!past && (
            ev.registration_open ? (
              <button
                onClick={onRegister}
                className="flex-1 bg-primary text-on-primary py-2.5 rounded-full text-sm font-bold font-headline hover:scale-[1.02] transition-all"
              >
                Register
              </button>
            ) : (
              <span className="flex-1 text-center py-2.5 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant">
                Reg. Closed
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
