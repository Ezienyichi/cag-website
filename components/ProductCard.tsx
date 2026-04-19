'use client';

import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'sonner';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  variant?: 'featured' | 'standard';
}

export default function ProductCard({ product, variant = 'standard' }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  function handleAddToCart() {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  }

  // Format price from kobo to Naira
  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: product.currency || 'NGN',
    minimumFractionDigits: 0,
  }).format(product.price / 100);

  if (variant === 'featured') {
    return (
      <div className="md:col-span-8 bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow flex flex-col md:flex-row group">
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          {product.is_editors_choice && (
            <div className="text-primary font-bold text-sm mb-2 font-headline">Editor's Choice</div>
          )}
          <h3 className="text-2xl md:text-3xl font-bold font-headline mb-3">{product.name}</h3>
          <p className="text-on-surface-variant mb-2">{product.short_description}</p>
          <p className="text-lg font-bold text-primary mb-6">{formattedPrice}</p>
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="bg-primary-container text-on-primary-container w-fit px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all font-headline"
            >
              Add to Cart
            </button>
            <button className="text-primary font-bold text-sm hover:underline underline-offset-4 font-headline">
              Explore
            </button>
          </div>
        </div>
        <div className="md:w-1/2 h-72 md:h-auto relative">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow hover:scale-[1.02] transition-transform duration-300 group">
      <div className="h-56 relative">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="p-6 md:p-8">
        <h3 className="text-xl font-bold font-headline mb-1.5">{product.name}</h3>
        <p className="text-on-surface-variant text-sm mb-2">{product.short_description}</p>
        <p className="text-base font-bold text-primary mb-4">{formattedPrice}</p>
        <button
          onClick={handleAddToCart}
          className="text-primary font-bold text-sm hover:underline underline-offset-4 font-headline"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
