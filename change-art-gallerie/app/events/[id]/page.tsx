import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';
import EventRegistrationForm from './EventRegistrationForm';

interface EventDetail {
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

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatPrice(p: number) {
  if (p === 0) return 'Free';
  return '₦' + p.toLocaleString('en-NG');
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createServerClient();
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('visible', true)
    .single();

  if (!event) notFound();

  const ev = event as EventDetail;
  const waUrl = ev.whatsapp_link || (ev.whatsapp_number ? `https://wa.me/${ev.whatsapp_number}` : null);

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 min-h-screen">
        <div className="px-6 md:px-8 max-w-screen-xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-8">
            <Link href="/events" className="hover:text-primary transition-colors">Events</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-on-surface font-medium truncate max-w-xs">{ev.title}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left: Image + Gallery */}
            <div className="lg:col-span-2 space-y-6">
              {ev.flyer_url && (
                <div className="rounded-2xl overflow-hidden bg-surface-container-high">
                  <img
                    src={ev.flyer_url}
                    alt={ev.title}
                    className="w-full object-cover max-h-[600px]"
                  />
                </div>
              )}

              {/* Additional images */}
              {(ev.additional_images || []).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(ev.additional_images || []).map((img, i) => (
                    <div key={i} className="rounded-xl overflow-hidden aspect-square bg-surface-container-high">
                      <img src={img} alt={`${ev.title} photo ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              {ev.description && (
                <div className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow">
                  <h2 className="text-lg font-bold font-headline mb-4">About This Event</h2>
                  <div className="text-on-surface-variant leading-relaxed whitespace-pre-line">{ev.description}</div>
                </div>
              )}

              {/* Google Maps embed */}
              {ev.location_url && (
                <div className="bg-surface-container-lowest rounded-2xl overflow-hidden ambient-shadow">
                  <div className="p-4 border-b border-outline-variant/10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary">map</span>
                    <span className="font-medium text-sm">Location</span>
                  </div>
                  <div className="p-4">
                    <p className="text-on-surface-variant text-sm mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      {ev.location}
                    </p>
                    <a
                      href={ev.location_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline"
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Details sidebar + Registration */}
            <div className="space-y-6">
              {/* Event info card */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold font-headline capitalize ${TYPE_STYLES[ev.event_type] || TYPE_STYLES.other}`}>
                    {ev.event_type}
                  </span>
                  {ev.featured && (
                    <span className="text-xs px-3 py-1 rounded-full font-bold bg-tertiary-container/30 text-tertiary">
                      Featured
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold font-headline mb-5 leading-tight">{ev.title}</h1>
                {ev.short_description && (
                  <p className="text-on-surface-variant text-sm mb-5">{ev.short_description}</p>
                )}

                <div className="space-y-3">
                  {ev.event_date && (
                    <div className="flex gap-3">
                      <span className="material-symbols-outlined text-base text-primary mt-0.5 shrink-0">calendar_today</span>
                      <div>
                        <p className="text-sm font-medium">{formatDate(ev.event_date)}</p>
                        {ev.event_time && <p className="text-xs text-on-surface-variant">{ev.event_time}{ev.end_time ? ` – ${ev.end_time}` : ''}</p>}
                        {ev.end_date && ev.end_date !== ev.event_date && (
                          <p className="text-xs text-on-surface-variant">Ends: {formatDate(ev.end_date)}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {ev.location && (
                    <div className="flex gap-3">
                      <span className="material-symbols-outlined text-base text-primary mt-0.5 shrink-0">location_on</span>
                      <div>
                        <p className="text-sm font-medium">{ev.location}</p>
                        {ev.location_url && (
                          <a href={ev.location_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                            View on map
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-base text-primary mt-0.5 shrink-0">payments</span>
                    <div>
                      <p className="text-sm font-bold text-primary">{formatPrice(ev.price)}</p>
                      {ev.max_attendees && (
                        <p className="text-xs text-on-surface-variant">Limited to {ev.max_attendees} attendees</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration form */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow">
                <h2 className="text-base font-bold font-headline mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">how_to_reg</span>
                  Register for this Event
                </h2>
                <EventRegistrationForm
                  eventId={ev.id}
                  registrationOpen={ev.registration_open}
                  whatsappLink={ev.whatsapp_link}
                  whatsappNumber={ev.whatsapp_number}
                />
              </div>

              {/* Share */}
              <div className="bg-surface-container-lowest rounded-2xl p-5 ambient-shadow">
                <p className="text-sm font-medium mb-3">Share this event</p>
                <div className="flex gap-2">
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#25D366] text-white py-2.5 rounded-full text-xs font-bold font-headline flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-all"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </a>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                    className="flex-1 bg-surface-container-high py-2.5 rounded-full text-xs font-bold font-headline flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">link</span>
                    Copy Link
                  </button>
                </div>
              </div>

              <Link
                href="/events"
                className="flex items-center gap-2 text-on-surface-variant text-sm hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                All Events
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
