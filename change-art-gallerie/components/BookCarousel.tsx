'use client';

import { useState } from 'react';
import Image from 'next/image';

interface BookCarouselProps {
  title: string;
  subtitle: string;
  ageRange: string;
  images: string[];
  accentColor: string;
  accentBg: string;
}

export default function BookCarousel({
  title,
  subtitle,
  ageRange,
  images,
  accentColor,
  accentBg,
}: BookCarouselProps) {
  const [current, setCurrent] = useState(0);

  function next() {
    setCurrent((prev) => (prev + 1) % images.length);
  }

  function prev() {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <div
            className={`inline-flex items-center gap-1.5 ${accentBg} ${accentColor} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-headline mb-2`}
          >
            {ageRange}
          </div>
          <h3 className="text-xl font-bold font-headline">{title}</h3>
          <p className="text-on-surface-variant text-sm">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-on-surface-variant font-medium">
            {current + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Image viewer */}
      <div className="relative mx-6 mb-4 rounded-lg overflow-hidden bg-surface-container-high aspect-[4/3]">
        <Image
          src={images[current]}
          alt={`${title} - Page ${current + 1}`}
          fill
          className="object-contain transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Nav arrows */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface-container-lowest/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md"
        >
          <span className="material-symbols-outlined text-on-surface">chevron_left</span>
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface-container-lowest/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md"
        >
          <span className="material-symbols-outlined text-on-surface">chevron_right</span>
        </button>
      </div>

      {/* Thumbnail strip */}
      <div className="px-6 pb-6 flex gap-2 overflow-x-auto">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 transition-all border-2 ${
              i === current
                ? 'border-primary scale-105 shadow-md'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Image
              src={img}
              alt={`Page ${i + 1}`}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
