'use client';

import { useState } from 'react';
import Image from 'next/image';

interface RealTimeGridProps {
  images: { src: string; caption: string }[];
}

export default function RealTimeGrid({ images }: RealTimeGridProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            className={`relative rounded-xl overflow-hidden group cursor-pointer ${
              i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
            }`}
          >
            <Image
              src={img.src}
              alt={img.caption}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes={i === 0 ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 50vw, 33vw'}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-inverse-surface/0 group-hover:bg-inverse-surface/30 transition-colors duration-300 flex items-end">
              <div className="p-3 md:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-xs md:text-sm font-medium">{img.caption}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[200] bg-inverse-surface/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[85vh] rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[lightbox].src}
              alt={images[lightbox].caption}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[80vh] object-contain bg-surface-container-lowest rounded-xl"
            />

            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 bg-inverse-surface/60 backdrop-blur-sm p-4 rounded-b-xl">
              <p className="text-white text-sm font-medium">{images[lightbox].caption}</p>
            </div>

            {/* Close button */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-10 h-10 bg-surface-container-lowest/90 rounded-full flex items-center justify-center hover:scale-110 transition-all"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Prev / Next */}
            {lightbox > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface-container-lowest/90 rounded-full flex items-center justify-center hover:scale-110 transition-all"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
            )}
            {lightbox < images.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface-container-lowest/90 rounded-full flex items-center justify-center hover:scale-110 transition-all"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
