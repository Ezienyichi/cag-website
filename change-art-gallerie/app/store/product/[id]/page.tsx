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
import { fbq } from '@/lib/pixel';

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
    hint: 'This is a physical product. Complete your order via WhatsApp and we\'ll arrange delivery.',
  },
  download: {
    icon: 'download',
    iconColor: 'text-primary',
    title: 'Digital Download — Instant Access',
    sub: 'Download your file immediately after payment. PDF format, read on any device.',
    badge: 'Digital Download',
    badgeCls: 'bg-primary-container/30 text-primary',
    hint: 'Instant download after payment.',
  },
  read_online: {
    icon: 'menu_book',
    iconColor: 'text-secondary',
    title: 'Read Online — Browser Access',
    sub: 'Read this book in your browser right after payment. No download needed.',
    badge: 'Read Online',
    badgeCls: 'bg-secondary-container/30 text-secondary',
    hint: 'Access immediately after payment.',
  },
} as const;

const WA_SVG = (
  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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
  const [whatsappNumber, setWhatsappNumber] = useState('2348012345678');

  const [quantity, setQuantity] = useState(1);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerLocation, setBuyerLocation] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createBrowserClient();
        const [productRes, settingsRes] = await Promise.all([
          supabase.from('products').select('*').eq('id', productId).single(),
          supabase.from('site_settings').select('key, value').eq('key', 'whatsapp_number'),
        ]);

        if (productRes.error || !productRes.data) { setNotFound(true); return; }
        setProduct(productRes.data as CMSProduct);
        setActiveImage(productRes.data.image_url || PLACEHOLDER);
        fbq('track', 'ViewContent', {
          content_ids: [productRes.data.id],
          content_name: productRes.data.name,
          content_type: 'product',
          value: productRes.data.price / 100,
          currency: 'NGN',
        });

        for (const row of settingsRes.data || []) {
          if (row.key === 'whatsapp_number') setWhatsappNumber(row.value);
        }

        const [relatedRes, imagesRes] = await Promise.all([
          supabase.from('products').select('*').eq('category', productRes.data.category).eq('in_stock', true).neq('id', productId).order('sort_order').limit(3),
          supabase.from('product_images').select('*').eq('product_id', productId).order('sort_order', { ascending: true }),
        ]);

        setRelatedProducts((relatedRes.data as CMSProduct[]) || []);
        setExtraImages((imagesRes.data as ProductImage[]) || []);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    }
    load();
  }, [productId]);

  function formatNaira(kobo: number) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(kobo / 100);
  }

  async function handleWhatsAppCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    if (!buyerName || !buyerEmail || !buyerPhone || !buyerLocation) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCheckoutLoading(true);
    try {
      // Save pending order so it shows in admin dashboard
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: buyerName,
          customer_email: buyerEmail,
          customer_phone: buyerPhone,
          location: buyerLocation,
          total_amount: product.price * quantity,
          currency: 'NGN',
          product_id: product.id,
          product_name: product.name,
          quantity,
          notes: 'WhatsApp order',
        }),
      });

      const message = encodeURIComponent(
        `Hi Change Art Gallerie! 👋\n\n` +
        `I'd like to order:\n\n` +
        `*Product:* ${product.name}\n` +
        `*Quantity:* ${quantity}\n` +
        `*Price:* ₦${((product.price * quantity) / 100).toLocaleString()}\n\n` +
        `*My Details:*\n` +
        `*Name:* ${buyerName}\n` +
        `*Email:* ${buyerEmail}\n` +
        `*Phone:* ${buyerPhone}\n` +
        `*Location:* ${buyerLocation}\n\n` +
        `Please confirm availability and delivery details. Thank you!`
      );

      fbq('track', 'Purchase', {
        content_ids: [product.id],
        content_name: product.name,
        value: (product.price * quantity) / 100,
        currency: 'NGN',
        num_items: quantity,
      });
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleFlutterwaveCheckout(e: React.FormEvent) {
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
  const isDigital = deliveryType === 'download' || deliveryType === 'read_online';
  const deliveryInfo = DELIVERY_INFO[deliveryType as keyof typeof DELIVERY_INFO] || DELIVERY_INFO.physical;
  const storeLabel = CATEGORY_STORE_LABEL[product.category] || product.category;
  const storeHref = `/store/${product.category}`;

  const handleCheckout = isPhysical ? handleWhatsAppCheckout : handleFlutterwaveCheckout;

  function startCheckout() {
    setShowCheckout(true);
    fbq('track', 'InitiateCheckout', {
      content_ids: [product.id],
      content_name: product.name,
      value: product.price / 100,
      currency: 'NGN',
    });
  }

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
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-surface-container-high ambient-shadow">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                className="object-cover transition-opacity duration-200"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold font-headline ${deliveryInfo.badgeCls}`}>
                {deliveryInfo.badge}
              </div>
              {product.featured && (
                <div className="absolute top-4 right-4 bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full text-xs font-bold font-headline">
                  Featured
                </div>
              )}
            </div>

            {extraImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-2">
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

            {/* Free Resource */}
            {product.free_resource_url && (
              <div className="bg-secondary-container/20 rounded-xl p-5 mb-6">
                <p className="font-bold font-headline mb-1">🎁 Free Resource Included</p>
                <p className="text-sm text-on-surface-variant mb-3">{product.free_resource_title || 'Free download included with this product'}</p>
                <a
                  href={product.free_resource_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-secondary text-on-secondary px-5 py-2 rounded-full font-bold text-sm inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download Free Resource
                </a>
              </div>
            )}

            {/* Price + Quantity */}
            <div className="flex items-center justify-between mb-4">
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

            {/* Delivery hint */}
            <p className="text-sm text-on-surface-variant mb-5 flex items-start gap-2">
              <span className="material-symbols-outlined text-base mt-0.5 shrink-0 text-primary">info</span>
              {deliveryInfo.hint}
            </p>

            {/* CTA / Checkout Form */}
            {!showCheckout ? (
              isPhysical ? (
                <button
                  onClick={startCheckout}
                  className="w-full bg-[#25D366] text-white py-4 rounded-full font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-headline flex items-center justify-center gap-2"
                >
                  {WA_SVG}
                  Complete Transaction on WhatsApp
                </button>
              ) : (
                <button
                  onClick={startCheckout}
                  className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-headline flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">
                    {deliveryType === 'download' ? 'download' : 'menu_book'}
                  </span>
                  {deliveryType === 'download' ? 'Buy & Download' : 'Buy & Read Online'}
                </button>
              )
            ) : (
              <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
                <h3 className="font-bold font-headline mb-4">
                  {isPhysical ? 'Your Order Details' : 'Complete Your Purchase'}
                </h3>
                <form onSubmit={handleCheckout} className="space-y-3">
                  <input
                    type="text"
                    value={buyerName}
                    onChange={e => setBuyerName(e.target.value)}
                    placeholder="Full name *"
                    required
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                  />
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={e => setBuyerEmail(e.target.value)}
                    placeholder="Email address *"
                    required
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                  />
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={e => setBuyerPhone(e.target.value)}
                    placeholder={isPhysical ? 'Phone number * (for delivery updates)' : 'Phone number (optional)'}
                    required={isPhysical}
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                  />
                  <input
                    type="text"
                    value={buyerLocation}
                    onChange={e => setBuyerLocation(e.target.value)}
                    placeholder={isPhysical ? 'Location / City * (e.g. Port Harcourt)' : 'Location / City (optional)'}
                    required={isPhysical}
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                  />

                  {isPhysical ? (
                    <>
                      <button
                        type="submit"
                        disabled={checkoutLoading}
                        className="w-full bg-[#25D366] text-white py-4 rounded-full font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 font-headline flex items-center justify-center gap-2"
                      >
                        {checkoutLoading ? 'Opening WhatsApp…' : (
                          <>
                            {WA_SVG}
                            Complete Transaction on WhatsApp
                          </>
                        )}
                      </button>
                      <p className="text-xs text-on-surface-variant text-center">
                        We'll confirm your order and arrange delivery over WhatsApp.
                      </p>
                    </>
                  ) : (
                    <>
                      <button
                        type="submit"
                        disabled={checkoutLoading}
                        className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 font-headline flex items-center justify-center gap-2"
                      >
                        {checkoutLoading ? 'Redirecting to payment…' : (
                          <>
                            <span className="material-symbols-outlined text-lg">lock</span>
                            Pay {formatNaira(product.price)} with Flutterwave
                          </>
                        )}
                      </button>
                      <p className="text-xs text-on-surface-variant text-center">
                        Secure payment powered by Flutterwave. Cards, bank transfer, and USSD accepted.
                      </p>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowCheckout(false)}
                    className="w-full text-xs text-on-surface-variant hover:text-on-surface transition-colors py-1"
                  >
                    Cancel
                  </button>
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
