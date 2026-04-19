import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative px-6 md:px-8 py-16 md:py-32 max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1 space-y-8 z-10">
        <div className="inline-flex items-center gap-2 bg-tertiary-container text-on-tertiary-container px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-headline">
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          Unleash Their Potential
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-on-surface tracking-tight leading-[1.1] font-headline">
          Unlock{' '}
          <span className="relative inline-block">
            Creativity
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-primary-fixed"
              preserveAspectRatio="none"
              viewBox="0 0 300 20"
            >
              <path
                d="M5 15Q150 2 295 15"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="6"
              />
            </svg>
          </span>{' '}
          in Every Child
        </h1>

        <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed">
          Fun and educational creative books for schools and homeschoolers.
          Designed to spark imagination through hands-on artistic play.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <a
            href="#collection"
            className="bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-bold text-base md:text-lg shadow-lg hover:scale-105 transition-transform font-headline"
          >
            Order Books
          </a>
          <a
            href="/waitlist"
            className="bg-surface-container-low text-primary px-8 py-4 rounded-full font-bold text-base md:text-lg hover:bg-surface-container-high transition-colors font-headline"
          >
            Join Waitlist
          </a>
        </div>
      </div>

      <div className="flex-1 relative">
        {/* Decorative blobs */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-secondary-container rounded-full mix-blend-multiply filter blur-xl opacity-70" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-tertiary-container rounded-full mix-blend-multiply filter blur-xl opacity-70" />

        <div className="relative rounded-xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
          <Image
            src="/images/hero-kids.png"
            alt="Creative kids drawing"
            width={600}
            height={750}
            className="w-full aspect-[4/5] object-cover"
            priority
          />
        </div>

        {/* Doodle overlay */}
        <div className="absolute -top-6 right-10 text-primary-fixed rotate-12">
          <span className="material-symbols-outlined text-6xl">brush</span>
        </div>
      </div>
    </section>
  );
}
