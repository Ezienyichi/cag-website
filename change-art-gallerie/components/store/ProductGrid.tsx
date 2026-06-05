'use client';

import Image from 'next/image';
import Link from 'next/link';

export interface CMSProduct {
  id: string;
  name: string;
  description: string | null;
  price: number; // in kobo
  category: string; // 'workbooks' | 'homeschooling' | 'digital'
  image_url: string | null;
  file_url: string | null;
  featured: boolean;
  in_stock: boolean;
  sort_order: number;
}

interface ProductGridProps {
  products: CMSProduct[];
}

function formatNaira(kobo: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

const CATEGORY_LABEL: Record<string, string> = {
  workbooks: 'School WorkBook',
  homeschooling: 'Homeschooling',
  digital: 'Digital',
};

const PLACEHOLDER = '/images/color-alchemist.png';

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-on-surface-variant">
        <span className="material-symbols-outlined text-5xl mb-3 block">inventory_2</span>
        <p className="font-medium">No products available yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const isDigital = product.category === 'digital' || product.category === 'homeschooling';
        return (
          <Link
            key={product.id}
            href={`/store/product/${product.id}`}
            className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow hover:scale-[1.02] transition-transform duration-300 flex flex-col group"
          >
            {/* Image */}
            <div className="h-56 relative bg-surface-container-high">
              <Image
                src={product.image_url || PLACEHOLDER}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              {product.featured && (
                <div className="absolute top-3 left-3 bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold font-headline">
                  Featured
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 flex flex-col flex-1">
              <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1.5 font-headline">
                {CATEGORY_LABEL[product.category] || product.category}
              </div>
              <h3 className="text-lg font-bold font-headline mb-2">{product.name}</h3>
              {product.description && (
                <p className="text-on-surface-variant text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* Price + CTA */}
              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-2xl font-bold text-primary font-headline">
                  {formatNaira(product.price)}
                </span>
                <span className="bg-primary-container text-on-primary-container px-5 py-2 rounded-full font-bold text-sm font-headline group-hover:scale-105 transition-all">
                  {isDigital ? 'View & Download' : 'View & Order'}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
