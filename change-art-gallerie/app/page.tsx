import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/sections/HeroSection';
import BenefitsSection from '@/components/sections/BenefitsSection';
import CollectionSection from '@/components/sections/CollectionSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import TestimonialSection, { CMSTestimonial } from '@/components/sections/TestimonialSection';
import CTASection from '@/components/sections/CTASection';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';

async function getFeaturedTestimonials(): Promise<CMSTestimonial[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('featured', true)
      .order('sort_order', { ascending: true })
      .limit(4);
    return data || [];
  } catch {
    return [];
  }
}

interface FeaturedEvent {
  id: string;
  title: string;
  short_description: string | null;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  flyer_url: string | null;
  event_type: string;
  price: number;
}

async function getFeaturedEvent(): Promise<FeaturedEvent | null> {
  try {
    const supabase = createServerClient();
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('events')
      .select('id, title, short_description, event_date, event_time, location, flyer_url, event_type, price')
      .eq('featured', true)
      .eq('visible', true)
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .limit(1)
      .single();
    return data || null;
  } catch {
    return null;
  }
}

async function getHeroBannerUrl(): Promise<string | undefined> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'hero_banner_url')
      .single();
    return data?.value || undefined;
  } catch {
    return undefined;
  }
}

export default async function HomePage() {
  const [testimonials, heroBannerUrl, featuredEvent] = await Promise.all([
    getFeaturedTestimonials(),
    getHeroBannerUrl(),
    getFeaturedEvent(),
  ]);

  return (
    <>
      <Navbar />
      <main className="pt-24 overflow-x-hidden">
        <HeroSection bannerUrl={heroBannerUrl} />
        <BenefitsSection />
        <CollectionSection />
        <HowItWorksSection />
        <TestimonialSection testimonials={testimonials.length > 0 ? testimonials : undefined} />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 -mt-6 mb-10 px-6">
          <Link href="/gallery" className="text-primary font-bold font-headline hover:underline text-sm flex items-center gap-1">
            See all testimonials
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
          <span className="hidden sm:block text-outline-variant">·</span>
          <Link href="/gallery" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm flex items-center gap-1">
            View our gallery
            <span className="material-symbols-outlined text-base">photo_library</span>
          </Link>
        </div>
        {featuredEvent && (
          <div className="px-6 md:px-8 max-w-screen-xl mx-auto mb-16">
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden ambient-shadow">
              <div className="grid md:grid-cols-2">
                <div className="h-56 md:h-auto relative bg-surface-container-high">
                  {featuredEvent.flyer_url ? (
                    <img src={featuredEvent.flyer_url} alt={featuredEvent.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">event</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-primary-container/80 text-primary px-3 py-1 rounded-full text-xs font-bold font-headline capitalize backdrop-blur-sm">
                    {featuredEvent.event_type}
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">event</span>
                    Upcoming Event
                  </p>
                  <h2 className="text-2xl font-bold font-headline mb-3">{featuredEvent.title}</h2>
                  {featuredEvent.short_description && (
                    <p className="text-on-surface-variant text-sm mb-4">{featuredEvent.short_description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant mb-6">
                    {featuredEvent.event_date && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-primary">calendar_today</span>
                        {new Date(featuredEvent.event_date + 'T00:00:00').toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {featuredEvent.event_time ? ` · ${featuredEvent.event_time}` : ''}
                      </span>
                    )}
                    {featuredEvent.location && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                        {featuredEvent.location}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/events/${featuredEvent.id}`} className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full font-bold font-headline text-sm hover:scale-105 transition-all">
                      Learn More
                    </Link>
                    <Link href="/events" className="text-primary font-bold text-sm font-headline flex items-center gap-1 hover:underline">
                      All Events
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
