import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';

export const metadata = {
  title: 'Gallery & Testimonials | Change Art Gallerie',
  description: 'View photos from Change Art Gallerie classrooms and read testimonials from parents, teachers and schools across Nigeria.',
};

interface GalleryPhoto {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  avatar_url: string | null;
  featured: boolean;
  sort_order: number;
}

async function getPhotos(): Promise<GalleryPhoto[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from('gallery_photos').select('*').order('sort_order');
    return data || [];
  } catch { return []; }
}

async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from('testimonials').select('*').order('sort_order');
    return data || [];
  } catch { return []; }
}

export default async function GalleryPage() {
  const [photos, testimonials] = await Promise.all([getPhotos(), getTestimonials()]);

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-screen-xl mx-auto px-6 md:px-8 py-16">

        {/* ── Photo Gallery ── */}
        <section className="mb-20">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold font-headline mb-3">Our Gallery</h1>
            <p className="text-on-surface-variant text-lg max-w-xl">
              See Change Art Gallerie in action across classrooms and homes in Nigeria.
            </p>
          </div>

          {photos.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-3 block">photo_library</span>
              <p>No photos yet — check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((p) => (
                <div key={p.id} className="rounded-xl overflow-hidden relative group cursor-pointer aspect-square bg-surface-container-high">
                  <img
                    src={p.image_url}
                    alt={p.caption || 'Gallery photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {p.caption && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-white text-xs font-medium leading-snug">{p.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Testimonials ── */}
        <section>
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-3">What People Are Saying</h2>
            <p className="text-on-surface-variant text-lg max-w-xl">
              Hear from parents, teachers and school administrators across Nigeria.
            </p>
          </div>

          {testimonials.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-3 block">format_quote</span>
              <p>No testimonials yet — check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => {
                const initial = t.name.charAt(0).toUpperCase();
                return (
                  <div key={t.id} className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      {t.avatar_url ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden relative shrink-0 bg-surface-container-high">
                          <Image
                            src={t.avatar_url}
                            alt={t.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold text-lg font-headline">{initial}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold font-headline leading-tight">{t.name}</p>
                        {t.role && <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">{t.role}</p>}
                      </div>
                      {t.featured && (
                        <span className="text-xs font-bold bg-primary-container/20 text-primary px-2 py-0.5 rounded-full shrink-0">Featured</span>
                      )}
                    </div>
                    <p className="text-on-surface-variant text-sm leading-relaxed italic flex-1">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA to shop */}
        <div className="mt-16 bg-surface-container-low rounded-xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold font-headline mb-2">Ready to get started?</h3>
            <p className="text-on-surface-variant">Explore our workbooks, homeschooling packs and digital storybooks.</p>
          </div>
          <div className="flex gap-3 shrink-0 flex-wrap">
            <Link href="/store/workbooks" className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full font-bold text-sm font-headline hover:scale-105 transition-all">
              Browse Shop
            </Link>
            <Link href="/resources" className="bg-surface-container-lowest text-primary px-6 py-2.5 rounded-full font-bold text-sm font-headline hover:scale-105 transition-all border border-outline-variant/20">
              Free Resources
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
