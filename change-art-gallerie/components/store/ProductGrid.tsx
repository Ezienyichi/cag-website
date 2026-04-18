'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { StoreProduct } from '@/lib/products';

interface ProductGridProps {
  products: StoreProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/store/product/${product.id}`}
          className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow hover:scale-[1.02] transition-transform duration-300 flex flex-col group"
        >
          {/* Image */}
          <div className="h-56 relative">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {product.tag && (
              <div className="absolute top-3 left-3 bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold font-headline">
                {product.tag}
              </div>
            )}
            <div className="absolute top-3 right-3 bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface-variant px-2.5 py-1 rounded-full text-xs font-medium">
              Ages {product.ageRange}
            </div>
          </div>

          {/* Info */}
          <div className="p-6 flex flex-col flex-1">
            <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1.5 font-headline">
              {product.category}
            </div>
            <h3 className="text-lg font-bold font-headline mb-2">{product.name}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-4 flex-1">
              {product.description}
            </p>

            {/* Price + CTA */}
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary font-headline">
                ₦{product.price.toLocaleString()}
              </span>
              <span className="bg-primary-container text-on-primary-container px-5 py-2 rounded-full font-bold text-sm font-headline group-hover:scale-105 transition-all">
                {product.type === 'physical' ? 'View & Order' : 'View & Download'}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
