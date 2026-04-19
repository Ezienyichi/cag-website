import Image from 'next/image';

export default function TestimonialSection() {
  return (
    <section id="testimonials" className="py-20 md:py-24 px-6 md:px-8 max-w-screen-xl mx-auto">
      <div className="bg-surface-container-lowest rounded-xl ambient-shadow-lg overflow-hidden flex flex-col lg:flex-row">
        {/* Video side */}
        <div className="lg:w-1/2 relative group min-h-[300px] md:min-h-[400px]">
          <Image
            src="/images/testimonial-teacher.png"
            alt="Teacher in classroom"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition-colors cursor-pointer">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/90 rounded-full flex items-center justify-center text-primary shadow-xl group-hover:scale-110 transition-transform">
              <span
                className="material-symbols-outlined text-4xl md:text-5xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                play_arrow
              </span>
            </div>
          </div>
        </div>

        {/* Quote side */}
        <div className="lg:w-1/2 p-8 md:p-12 lg:p-20 flex flex-col justify-center">
          <div className="flex gap-1 text-primary-fixed-dim mb-6">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            ))}
          </div>

          <blockquote className="text-xl md:text-2xl lg:text-3xl font-medium leading-tight text-on-surface mb-8 italic">
            &ldquo;These books have transformed how we teach creative arts.
            My pupils look forward to every lesson now!&rdquo;
          </blockquote>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY5qUFxmlZpr1xlefy99Xeswf6Wtw1V9w2xMds1qJqlCribD_WK21dY5Cqnh5hW1Sdx9sfT9k2Xj0DYm9rX-p7hCR6iGrp8JRZ3-OJYuByn8Bh6VB_MzZlviFYVhJAwrCMY9xGXzO9qdXrPfMaBx_hJePbcbWGJWb6xUdD5wFJXY8MWWN8ILxGqzr8N9oT2baYr6IWZnOH4RTXznislECjFVfMv8SRri-0Vp66BHIaX56lUJ5PSS0zS5ChEA86Czoa4ElN_Gp1tod6"
                alt="Mrs. Adaeze Okonkwo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-lg font-headline">Sarah Jenkins</div>
              <div className="text-on-surface-variant text-sm">Head Teacher, Favor Height Montessori School</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
