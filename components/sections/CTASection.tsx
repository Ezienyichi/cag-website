export default function CTASection() {
  return (
    <section className="px-6 md:px-8 pb-12">
      <div className="max-w-screen-2xl mx-auto rounded-xl bg-gradient-to-br from-primary to-primary-dim p-12 md:p-16 lg:p-24 text-center relative overflow-hidden shadow-2xl">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-black/5 rounded-full translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-on-primary mb-6 md:mb-8 leading-tight font-headline">
            Ready to start the adventure?
          </h2>
          <p className="text-on-primary/80 text-lg md:text-xl mb-8 md:mb-12">
            Join thousands of families and educators transforming education through art.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
            <a
              href="#collection"
              className="bg-surface-container-lowest text-primary px-8 md:px-10 py-4 md:py-5 rounded-full font-extrabold text-lg md:text-xl shadow-xl hover:scale-105 active:scale-95 transition-all font-headline"
            >
              Get the Books Now
            </a>
            <a
              href="/waitlist"
              className="border-2 border-white/30 text-white px-8 md:px-10 py-4 md:py-5 rounded-full font-bold text-lg md:text-xl hover:bg-white/10 transition-colors font-headline"
            >
              Request a Sample
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
