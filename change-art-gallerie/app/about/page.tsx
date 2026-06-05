import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 overflow-x-hidden">

        {/* ── Hero ── */}
        <section className="px-6 md:px-8 py-16 md:py-24 max-w-screen-xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center bg-tertiary-container text-on-tertiary-container px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-headline mb-6">
              Our Story
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline text-on-surface leading-tight mb-6">
              Building the Future of Creative Education in Africa
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-2xl">
              Change Art Gallerie was founded with one mission: to make high-quality,
              curriculum-aligned creative arts education accessible to every child in Nigeria and beyond.
            </p>
          </div>
        </section>

        {/* ── Mission & Vision ── */}
        <section className="bg-surface-container-low py-16 md:py-20 px-6 md:px-8">
          <div className="max-w-screen-xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="bg-surface-container-lowest rounded-xl p-8 md:p-10 ambient-shadow">
              <div className="w-12 h-12 bg-primary-container/30 rounded-xl flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-2xl text-primary">flag</span>
              </div>
              <h2 className="text-2xl font-bold font-headline mb-3">Our Mission</h2>
              <p className="text-on-surface-variant leading-relaxed">
                To create Montessori-approved creative arts books that inspire curiosity, develop fine motor skills,
                and celebrate African culture — making every child&apos;s learning journey joyful and meaningful.
              </p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-8 md:p-10 ambient-shadow">
              <div className="w-12 h-12 bg-secondary-container/30 rounded-xl flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-2xl text-secondary">visibility</span>
              </div>
              <h2 className="text-2xl font-bold font-headline mb-3">Our Vision</h2>
              <p className="text-on-surface-variant leading-relaxed">
                A Nigeria where every nursery and primary school child has access to world-class creative arts
                education — rooted in their culture, aligned with global standards, and delivered with love.
              </p>
            </div>
          </div>
        </section>

        {/* ── Story ── */}
        <section className="py-16 md:py-24 px-6 md:px-8 max-w-screen-xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-5">
                How It All Started
              </h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed">
                <p>
                  Change Art Gallerie was born in Port Harcourt, Nigeria, out of a deep frustration
                  with the lack of quality, culturally-relevant creative arts materials for young children.
                </p>
                <p>
                  Our founder noticed that while children in Nigerian nurseries were eager to learn and
                  create, the available textbooks were either outdated, culturally disconnected, or simply
                  unappealing to young minds.
                </p>
                <p>
                  That&apos;s when we decided to build something different — workbooks that blend the
                  globally-trusted Montessori curriculum with rich African storytelling, folktales, and
                  handicraft traditions. Books that make children excited to open them every morning.
                </p>
              </div>
              <div className="mt-8 flex gap-4">
                <Link
                  href="/store/workbooks"
                  className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-bold font-headline text-sm hover:scale-105 transition-all"
                >
                  See Our Books
                </Link>
                <Link
                  href="/waitlist"
                  className="bg-surface-container-low text-primary px-6 py-3 rounded-full font-bold font-headline text-sm hover:bg-surface-container-high transition-colors"
                >
                  Join Waitlist
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-xl overflow-hidden ambient-shadow">
                <Image
                  src="/images/191319852_527628518604722_257912934169763907_n.jpg"
                  alt="Change Art Gallerie founder"
                  width={600}
                  height={600}
                  className="w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-tertiary-container rounded-full mix-blend-multiply filter blur-xl opacity-70" />
            </div>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="bg-surface-container-low py-16 md:py-20 px-6 md:px-8">
          <div className="max-w-screen-xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-3">What We Stand For</h2>
              <p className="text-on-surface-variant max-w-lg mx-auto">
                Every book we make is guided by these core principles.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: 'school', color: 'bg-primary-container/20 text-primary', title: 'Education First', desc: 'Every activity is grounded in the Montessori curriculum and approved by NERDC.' },
                { icon: 'public', color: 'bg-secondary-container/20 text-secondary', title: 'African Identity', desc: 'Our books celebrate African folktales, music, and handicraft — building cultural pride from day one.' },
                { icon: 'favorite', color: 'bg-tertiary-container/20 text-tertiary', title: 'Made with Love', desc: 'Designed by educators and parents who deeply care about childhood development.' },
                { icon: 'palette', color: 'bg-primary-container/20 text-primary', title: 'Creative Expression', desc: 'We believe every child is an artist. Our books give them the space and tools to prove it.' },
                { icon: 'groups', color: 'bg-secondary-container/20 text-secondary', title: 'Community Driven', desc: 'Built for schools, homeschoolers, and families — with bulk pricing and distributor partnerships.' },
                { icon: 'verified', color: 'bg-tertiary-container/20 text-tertiary', title: 'Quality Guaranteed', desc: 'Printed on quality materials, packed with YouTube practice videos and assignment record sheets.' },
              ].map((v) => (
                <div key={v.title} className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
                  <div className={`w-11 h-11 ${v.color} rounded-xl flex items-center justify-center mb-4`}>
                    <span className="material-symbols-outlined text-xl">{v.icon}</span>
                  </div>
                  <h3 className="font-bold font-headline text-base mb-2">{v.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ── */}
        <section className="py-16 md:py-24 px-6 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-3">The Team</h2>
            <p className="text-on-surface-variant max-w-lg mx-auto">
              Passionate educators and creatives dedicated to transforming how children learn.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow text-center">
              <div className="h-64 relative">
                <Image
                  src="/images/Gemini_Generated_Image_sg1vb8sg1vb8sg1v.png"
                  alt="Founder"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold font-headline text-lg mb-1">Founder & Creative Director</h3>
                <p className="text-on-surface-variant text-sm">Change Art Gallerie</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow text-center">
              <div className="h-64 relative">
                <Image
                  src="/images/chinedu.png"
                  alt="Chinedu"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold font-headline text-lg mb-1">Chinedu</h3>
                <p className="text-on-surface-variant text-sm">Curriculum & Content Lead</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="px-6 md:px-8 pb-16 md:pb-24">
          <div className="max-w-screen-xl mx-auto bg-tertiary-container rounded-xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="relative z-10 max-w-xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black text-on-tertiary-container font-headline mb-4">
                Ready to inspire your child?
              </h2>
              <p className="text-on-tertiary-container/80 text-lg mb-8">
                Join thousands of parents and educators who have already discovered our books.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/store/workbooks"
                  className="bg-on-tertiary-container text-tertiary-container px-8 py-4 rounded-full font-bold font-headline hover:scale-105 active:scale-95 transition-all"
                >
                  Shop Now
                </Link>
                <Link
                  href="/waitlist"
                  className="border-2 border-on-tertiary-container/30 text-on-tertiary-container px-8 py-4 rounded-full font-bold font-headline hover:bg-on-tertiary-container/10 transition-colors"
                >
                  Join the Waitlist
                </Link>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
              <span className="material-symbols-outlined text-[200px]">palette</span>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
