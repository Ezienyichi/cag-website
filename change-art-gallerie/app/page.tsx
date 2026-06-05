import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/sections/HeroSection';
import BenefitsSection from '@/components/sections/BenefitsSection';
import CollectionSection from '@/components/sections/CollectionSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import TestimonialSection, { CMSTestimonial } from '@/components/sections/TestimonialSection';
import CTASection from '@/components/sections/CTASection';
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

export default async function HomePage() {
  const testimonials = await getFeaturedTestimonials();

  return (
    <>
      <Navbar />
      <main className="pt-24 overflow-x-hidden">
        <HeroSection />
        <BenefitsSection />
        <CollectionSection />
        <HowItWorksSection />
        <TestimonialSection testimonials={testimonials.length > 0 ? testimonials : undefined} />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
