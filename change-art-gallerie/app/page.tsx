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
  const [testimonials, heroBannerUrl] = await Promise.all([
    getFeaturedTestimonials(),
    getHeroBannerUrl(),
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
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
