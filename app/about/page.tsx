import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TEAM = [
  {
    name: 'Goodness Dan-Okoro',
    role: 'Founder & Creative Designer',
    image: '/images/team-goodness.jpg',
  },
  {
    name: 'Ikechukwu Godspower',
    role: 'Head of Media',
    image: '/images/team-ikechukwu.png',
  },
  {
    name: 'Mercy Omarayen',
    role: 'Admin',
    image: '/images/team-mercy.png',
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 overflow-x-hidden">
        {/* ============================================ */}
        {/* HERO */}
        {/* ============================================ */}
        <section className="px-6 md:px-8 max-w-screen-xl mx-auto mb-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-tertiary-container text-on-tertiary-container px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-headline mb-6">
              <span className="material-symbols-outlined text-[16px]">groups</span>
              Our Story
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline text-on-surface tracking-tight leading-[1.1] mb-6">
              Building the Future of{' '}
              <span className="relative inline-block">
                Creative Arts
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-primary-fixed"
                  preserveAspectRatio="none"
                  viewBox="0 0 300 20"
                >
                  <path d="M5 15Q150 2 295 15" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="6" />
                </svg>
              </span>{' '}
              Education
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed">
              We&apos;re a team of educators, designers, and child development advocates on a mission to make quality creative arts education accessible to every Nigerian child.
            </p>
          </div>
        </section>

        {/* ============================================ */}
        {/* THE PROBLEM & OUR RESPONSE */}
        {/* ============================================ */}
        <section className="bg-surface-container-low py-20 px-6 md:px-8">
          <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-headline mb-6">Why We Started</h2>
              <p className="text-on-surface-variant leading-relaxed mb-4">
                Nigerian nursery schools had almost no access to affordable, culturally relevant creative arts teaching materials. While schools across the country taught subjects like mathematics and English with structured textbooks, creative arts — music, folktales, handicraft — was treated as an afterthought, taught with photocopied worksheets or nothing at all.
              </p>
              <p className="text-on-surface leading-relaxed font-medium">
                We set out to change that.
              </p>
              <p className="text-on-surface-variant leading-relaxed mt-4">
                Our founding team of educators, designers, and child development advocates came together to create what didn&apos;t exist in the market — a complete creative arts learning system built specifically for Nigerian children ages 2 to 5. Not imported workbooks with foreign references that children couldn&apos;t relate to, but beautifully crafted, Montessori-approved books rooted in African storytelling, local handicraft traditions, and the rich musical heritage of our culture.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary-container rounded-full mix-blend-multiply filter blur-xl opacity-50" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-tertiary-container rounded-full mix-blend-multiply filter blur-xl opacity-50" />
              <div className="relative bg-surface-container-lowest rounded-xl p-8 ambient-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-container/20 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">flag</span>
                  </div>
                  <h3 className="font-bold font-headline text-lg">Our Mission</h3>
                </div>
                <p className="text-on-surface text-lg font-medium leading-relaxed italic">
                  &ldquo;To make quality creative arts education accessible, affordable, and culturally meaningful for every Nigerian child — starting from the nursery classroom.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* WHAT WE'VE BUILT */}
        {/* ============================================ */}
        <section className="py-20 px-6 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-3">What We&apos;ve Built</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <p className="text-on-surface-variant leading-relaxed mb-6">
              What started as a single workbook idea has grown into a full educational ecosystem. Today, Change Art Gallerie publishes three Montessori-approved creative arts workbooks for Nursery 1, 2, and 3, each bundled with exclusive YouTube practice class videos and built-in assignment allocation record sheets for parents and guardians. Our books follow the global Montessori curriculum design and are approved by the Nigerian Educational Research and Development Council (NERDC).
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              Beyond physical books, we offer downloadable homeschooling resource packs for parents who teach at home, and a growing library of affordable digital storybooks covering Christian values, African folktales, and early literacy.
            </p>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            <div className="bg-surface-container-lowest rounded-xl p-6 text-center ambient-shadow">
              <div className="text-3xl font-black font-headline text-primary mb-1">1,500+</div>
              <p className="text-on-surface-variant text-sm">Workbooks distributed</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 text-center ambient-shadow">
              <div className="text-3xl font-black font-headline text-secondary mb-1">3</div>
              <p className="text-on-surface-variant text-sm">Nursery levels covered</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 text-center ambient-shadow">
              <div className="text-3xl font-black font-headline text-tertiary mb-1">NERDC</div>
              <p className="text-on-surface-variant text-sm">Curriculum approved</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 text-center ambient-shadow">
              <div className="text-3xl font-black font-headline text-primary-dim mb-1">Montessori</div>
              <p className="text-on-surface-variant text-sm">Globally recognised framework</p>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* MEET THE TEAM */}
        {/* ============================================ */}
        <section className="bg-surface-container-low py-20 px-6 md:px-8">
          <div className="max-w-screen-xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-3">Meet the Team</h2>
              <p className="text-on-surface-variant max-w-md mx-auto">
                The people behind every page, every illustration, and every child&apos;s smile.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-10 md:gap-16">
              {TEAM.map((member) => (
                <div key={member.name} className="flex flex-col items-center text-center group">
                  <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden mb-5 ring-4 ring-surface-container-lowest ambient-shadow group-hover:scale-105 transition-transform duration-300 relative">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="176px"
                    />
                  </div>
                  <h3 className="text-lg font-bold font-headline mb-1">{member.name}</h3>
                  <p className="text-on-surface-variant text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* IMPACT & PARTNERSHIPS */}
        {/* ============================================ */}
        <section className="py-20 px-6 md:px-8 max-w-screen-xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-surface-container-lowest rounded-xl p-8 md:p-10 ambient-shadow">
              <div className="w-12 h-12 bg-secondary-container/20 rounded-xl flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-2xl text-secondary">public</span>
              </div>
              <h3 className="text-xl font-bold font-headline mb-3">Our Impact So Far</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Since launching, we have distributed over 1,500 workbooks to schools and families across the country, with growing demand from Lagos, Delta, Abuja, and Edo States. We currently work with distributors across multiple cities to ensure quicker delivery, and our waitlist of interested parents and educators continues to grow daily.
              </p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-8 md:p-10 ambient-shadow">
              <div className="w-12 h-12 bg-tertiary-container/20 rounded-xl flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-2xl text-tertiary">handshake</span>
              </div>
              <h3 className="text-xl font-bold font-headline mb-3">Partnerships &amp; Approvals</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Our content is developed in alignment with the NERDC-approved national curriculum and follows the globally recognised Montessori educational framework. We are proud members of the growing movement of African edtech publishers who believe that world-class education starts with world-class materials — made right here in Nigeria.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* WHAT DRIVES US */}
        {/* ============================================ */}
        <section className="px-6 md:px-8 pb-16">
          <div className="max-w-screen-2xl mx-auto rounded-xl bg-gradient-to-br from-primary to-primary-dim p-12 md:p-16 lg:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/5 rounded-full translate-x-1/3 translate-y-1/3" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-on-primary mb-6 font-headline">
                What Drives Us
              </h2>
              <p className="text-on-primary/90 text-lg md:text-xl leading-relaxed mb-8">
                Every child deserves to discover the artist inside them. Not every family can afford private art classes, and not every school has a trained creative arts teacher. But every classroom can have a Change Art Gallerie workbook. That&apos;s the future we&apos;re building — one book, one child, one school at a time.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/waitlist"
                  className="bg-surface-container-lowest text-primary px-8 py-4 rounded-full font-extrabold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all font-headline"
                >
                  Join the Waitlist
                </Link>
                <Link
                  href="/store/workbooks"
                  className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors font-headline"
                >
                  Shop Our Books
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
