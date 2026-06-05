'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { CMSProduct } from '@/components/store/ProductGrid';

const PLACEHOLDER = '/images/color-alchemist.png';

const CATEGORY_STORE_LABEL: Record<string, string> = {
  workbooks: 'School WorkBooks',
  homeschooling: 'Homeschooling',
  digital: 'Digital Storybooks',
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<CMSProduct | null>(null);
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
        const res = await fetch('/api/products');
        const data = await res.json();
        const all: CMSProduct[] = data.products || [];
        const found = all.find((p) => p.id === productId);

        if (!found) {
          setNotFound(true);
          return;
        }

        setProduct(found);
        setRelatedProducts(all.filter((p) => p.category === found.category && p.id !== found.id).slice(0, 3));
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;

    if (!buyerName || !buyerEmail) {
      toast.error('Please fill in your name and email');
      return;
    }

    setCheckoutLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              product: {
                id: product.id,
                name: product.name,
                short_description: product.description || '',
                price: product.price, // already in kobo
                currency: 'NGN',
                image_url: product.image_url || '',
              },
              quantity,
            },
          ],
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
    } catch {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setCheckoutLoading(false);
    }
  }

  function formatNaira(kobo: number) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(kobo / 100);
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

  const isDigital = product.category === 'digital' || product.category === 'homeschooling';
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
          {/* Left: Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-container-high ambient-shadow">
            <Image
              src={product.image_url || PLACEHOLDER}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {product.featured && (
              <div className="absolute top-4 left-4 bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full text-sm font-bold font-headline">
                Featured
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div>
            <div className="text-xs text-primary font-bold uppercase tracking-wider mb-2 font-headline">
              {storeLabel}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">{product.name}</h1>
            {product.description && (
              <p className="text-on-surface-variant text-lg leading-relaxed mb-6">{product.description}</p>
            )}

            {/* Delivery info */}
            <div className="bg-surface-container-low rounded-xl p-4 mb-6">
              {isDigital ? (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary">download</span>
                  <div>
                    <p className="font-bold text-sm font-headline">Digital Download — Instant Access</p>
                    <p className="text-xs text-on-surface-variant">Download immediately after payment. PDF format, read on any device.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">local_shipping</span>
                  <div>
                    <p className="font-bold text-sm font-headline">Physical Book — Delivered to You</p>
                    <p className="text-xs text-on-surface-variant">Delivery available across Rivers State and beyond.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Price + Quantity */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-3xl font-bold text-primary font-headline">
                  {formatNaira(product.price * quantity)}
                </span>
                {quantity > 1 && (
                  <span className="text-sm text-on-surface-variant ml-2">
                    ({formatNaira(product.price)} × {quantity})
                  </span>
                )}
              </div>
              {!isDigital && (
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

            {/* Checkout Form */}
            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-headline flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                {isDigital ? 'Buy & Download' : 'Order Now'}
              </button>
            ) : (
              <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
                <h3 className="font-bold font-headline mb-4">Complete Your Order</h3>
                <form onSubmit={handleCheckout} className="space-y-3">
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                  />
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                  />
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="Phone number (for delivery updates)"
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                  />
                  <button
                    type="submit"
                    disabled={checkoutLoading}
                    className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed font-headline flex items-center justify-center gap-2"
                  >
                    {checkoutLoading ? (
                      'Redirecting to payment…'
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">lock</span>
                        Pay {formatNaira(product.price * quantity)} with Flutterwave
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
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/store/product/${rp.id}`}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow hover:scale-[1.02] transition-transform flex flex-col group"
                >
                  <div className="h-44 relative bg-surface-container-high">
                    <Image src={rp.image_url || PLACEHOLDER} alt={rp.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1 font-headline">{storeLabel}</p>
                    <h3 className="font-bold font-headline mb-1">{rp.name}</h3>
                    <span className="text-lg font-bold text-primary font-headline">{formatNaira(rp.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
