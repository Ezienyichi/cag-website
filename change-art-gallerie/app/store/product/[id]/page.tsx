'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { CMSProduct } from '@/components/store/ProductGrid';
import { createBrowserClient } from '@/lib/supabase';

const PLACEHOLDER = '/images/color-alchemist.png';

const CATEGORY_STORE_LABEL: Record<string, string> = {
  workbooks: 'School WorkBooks',
  homeschooling: 'Homeschooling',
  digital: 'Digital Storybooks',
};

const DELIVERY_INFO = {
  physical: {
    icon: 'local_shipping',
    iconColor: 'text-tertiary',
    title: 'Physical Book — Delivered to You',
    sub: 'Delivery available across Rivers State and beyond.',
    badge: 'Hard Copy',
    badgeCls: 'bg-tertiary-container/30 text-tertiary',
  },
  download: {
    icon: 'download',
    iconColor: 'text-primary',
    title: 'Digital Download — Instant Access',
    sub: 'Download your file immediately after payment. PDF format, read on any device.',
    badge: 'Digital Download',
    badgeCls: 'bg-primary-container/30 text-primary',
  },
  read_online: {
    icon: 'menu_book',
    iconColor: 'text-secondary',
    title: 'Read Online — Browser Access',
    sub: 'Read this book in your browser right after payment. No download needed.',
    badge: 'Read Online',
    badgeCls: 'bg-secondary-container/30 text-secondary',
  },
} as const;

function getCtaLabel(deliveryType: string) {
  if (deliveryType === 'download') return 'Buy & Download';
  if (deliveryType === 'read_online') return 'Buy & Read Online';
  return 'Order Now';
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  interface ProductImage { id: string; image_url: string; sort_order: number; }

  const [product, setProduct] = useState<CMSProduct | null>(null);
  const [extraImages, setExtraImages] = useState<ProductImage[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [relatedProducts, setRelatedProducts] = useState<CMSProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createBrowserClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error || !data) { setNotFound(true); return; }

        setProduct(data as CMSProduct);
        setActiveImage(data.image_url || PLACEHOLDER);

        const [relatedRes, imagesRes] = await Promise.all([
          supabase
            .from('products')
            .select('*')
            .eq('category', data.category)
            .eq('in_stock', true)
            .neq('id', productId)
            .order('sort_order')
            .limit(3),
          supabase
            .from('product_images')
            .select('*')
            .eq('product_id', productId)
            .order('sort_order', { ascending: true }),
        ]);

        setRelatedProducts((relatedRes.data as CMSProduct[]) || []);
        setExtraImages((imagesRes.data as ProductImage[]) || []);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    }
    load();
  }, [productId]);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    if (!buyerName || !buyerEmail) { toast.error('Please fill in your name and email'); return; }

    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            product: {
              id: product.id,
              name: product.name,
              short_description: product.description || '',
              price: product.price,
              currency: 'NGN',
              image_url: product.image_url || '',
              delivery_type: product.delivery_type || 'physical',
            },
            quantity,
          }],
          customerEmail: buyerEmail,
          customerName: buyerName,
        }),
      });

      const data = await res.json();
      if (data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        toast.error(data.error || 'Failed to create payment. Please try again.');
      }
    } catch { toast.error('Network error. Please check your connection and try again.'); }
    finally { setCheckoutLoading(false); }
  }

  function formatNaira(kobo: number) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(kobo / 100);
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-16 px-6 md:px-8 max-w-screen-xl mx-auto min-h-screen flex items-center justify-center">
          <div className="text-on-surface-variant">Loading…</div>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !product) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-16 px-6 md:px-8 max-w-screen-xl mx-auto min-h-screen flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">search_off</span>
            <h1 className="text-2xl font-bold font-headline mb-2">Product not found</h1>
            <p className="text-on-surface-variant mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/store/workbooks" className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-bold font-headline">
              Browse Store
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const deliveryType = product.delivery_type || 'physical';
  const isPhysical = deliveryType === 'physical';
  const deliveryInfo = DELIVERY_INFO[deliveryType as keyof typeof DELIVERY_INFO] || DELIVERY_INFO.physical;
  const storeLabel = CATEGORY_STORE_LABEL[product.category] || product.category;
  const storeHref = `/store/${product.category}`;

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 px-6 md:px-8 max-w-screen-xl mx-auto min-h-screen">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-8 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href={storeHref} className="hover:text-primary transition-colors">{storeLabel}</Link>
          <span>/</span>
          <span className="text-on-surface font-medium">{product.name}</span>
        </div>

        {/* Product Layout */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 mb-16">
          {/* Left: Image gallery */}
          <div className="flex flex-col gap-3">
            {/* Main (active) image */}
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-surface-container-high ambient-shadow">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                className="object-cover transition-opacity duration-200"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Delivery badge */}
              <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold font-headline ${deliveryInfo.badgeCls}`}>
                {deliveryInfo.badge}
              </div>
              {product.featured && (
                <div className="absolute top-4 right-4 bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full text-xs font-bold font-headline">
                  Featured
                </div>
              )}
            </div>

            {/* Thumbnail strip — only rendered when there are extra images */}
            {extraImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {/* Cover image thumbnail */}
                {(() => {
                  const coverSrc = product.image_url || PLACEHOLDER;
                  const isActive = activeImage === coverSrc;
                  return (
                    <button
                      type="button"
                      onClick={() => setActiveImage(coverSrc)}
                      className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        isActive ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={coverSrc} alt="Cover" className="w-full h-full object-cover" />
                    </button>
                  );
                })()}

                {/* Extra image thumbnails */}
                {extraImages.map(img => {
                  const isActive = activeImage === img.image_url;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImage(img.image_url)}
                      className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        isActive ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div>
            <div className="text-xs text-primary font-bold uppercase tracking-wider mb-2 font-headline">
              {storeLabel}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">{product.name}</h1>
            {product.description && (
              <p className="text-on-surface-variant text-lg leading-relaxed mb-6">{product.description}</p>
            )}

            {/* Delivery info card */}
            <div className="bg-surface-container-low rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${deliveryInfo.iconColor}`}>{deliveryInfo.icon}</span>
                <div>
                  <p className="font-bold text-sm font-headline">{deliveryInfo.title}</p>
                  <p className="text-xs text-on-surface-variant">{deliveryInfo.sub}</p>
                </div>
              </div>
            </div>

            {/* Price + Quantity (only physical gets quantity selector) */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-3xl font-bold text-primary font-headline">
                  {formatNaira(product.price * (isPhysical ? quantity : 1))}
                </span>
                {isPhysical && quantity > 1 && (
                  <span className="text-sm text-on-surface-variant ml-2">
                    ({formatNaira(product.price)} × {quantity})
                  </span>
                )}
              </div>
              {isPhysical && (
                <div className="flex items-center gap-3 bg-surface-container-high rounded-full px-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors text-lg font-bold"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* CTA / Checkout Form */}
            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-headline flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">
                  {deliveryType === 'download' ? 'download' : deliveryType === 'read_online' ? 'menu_book' : 'shopping_cart'}
                </span>
                {getCtaLabel(deliveryType)}
              </button>
            ) : (
              <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
                <h3 className="font-bold font-headline mb-4">Complete Your Purchase</h3>
                <form onSubmit={handleCheckout} className="space-y-3">
                  <input
                    type="text"
                    value={buyerName}
                    onChange={e => setBuyerName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                  />
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={e => setBuyerEmail(e.target.value)}
                    placeholder="Your email address (for order confirmation)"
                    required
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                  />
                  {isPhysical && (
                    <input
                      type="tel"
                      value={buyerPhone}
                      onChange={e => setBuyerPhone(e.target.value)}
                      placeholder="Phone number (for delivery updates)"
                      className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                    />
                  )}
                  <button
                    type="submit"
                    disabled={checkoutLoading}
                    className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 font-headline flex items-center justify-center gap-2"
                  >
                    {checkoutLoading ? 'Redirecting to payment…' : (
                      <>
                        <span className="material-symbols-outlined text-lg">lock</span>
                        Pay {formatNaira(product.price * (isPhysical ? quantity : 1))} with Flutterwave
                      </>
                    )}
                  </button>
                  <p className="text-xs text-on-surface-variant text-center">
                    Secure payment powered by Flutterwave. Cards, bank transfer, and USSD accepted.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold font-headline mb-6">You May Also Like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rp) => {
                const rpDelivery = DELIVERY_INFO[(rp.delivery_type || 'physical') as keyof typeof DELIVERY_INFO] || DELIVERY_INFO.physical;
                return (
                  <Link
                    key={rp.id}
                    href={`/store/product/${rp.id}`}
                    className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow hover:scale-[1.02] transition-transform flex flex-col group"
                  >
                    <div className="h-44 relative bg-surface-container-high">
                      <Image src={rp.image_url || PLACEHOLDER} alt={rp.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold ${rpDelivery.badgeCls}`}>
                        {rpDelivery.badge}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold font-headline mb-1">{rp.name}</h3>
                      <span className="text-lg font-bold text-primary font-headline">{formatNaira(rp.price)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
