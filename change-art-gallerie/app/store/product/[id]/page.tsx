'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getProductById, ALL_PRODUCTS } from '@/lib/products';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const product = getProductById(productId);

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  if (!product) {
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

  const allImages = [product.image, ...product.gallery.filter((img) => img !== product.image)];
  const relatedProducts = ALL_PRODUCTS.filter((p) => p.store === product.store && p.id !== product.id).slice(0, 3);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();

    if (!buyerName || !buyerEmail) {
      toast.error('Please fill in your name and email');
      return;
    }

    setLoading(true);

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
                short_description: product.description,
                price: product.price * 100, // Naira to kobo
                currency: 'NGN',
                image_url: product.image,
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
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 px-6 md:px-8 max-w-screen-xl mx-auto min-h-screen">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-8 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/store/${product.store}`} className="hover:text-primary transition-colors capitalize">
            {product.store === 'workbooks' ? 'School WorkBooks' : product.store === 'homeschooling' ? 'Homeschooling' : 'Digital Storybooks'}
          </Link>
          <span>/</span>
          <span className="text-on-surface font-medium">{product.name}</span>
        </div>

        {/* Product Layout */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 mb-16">
          {/* Left: Image Gallery */}
          <div>
            {/* Main image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-container-high mb-4 ambient-shadow">
              <Image
                src={allImages[activeImage]}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {product.tag && (
                <div className="absolute top-4 left-4 bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full text-sm font-bold font-headline">
                  {product.tag}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      i === activeImage ? 'border-primary scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`View ${i + 1}`} width={80} height={80} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div>
            <div className="text-xs text-primary font-bold uppercase tracking-wider mb-2 font-headline">
              {product.category} · Ages {product.ageRange}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">{product.name}</h1>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-6">{product.longDescription}</p>

            {/* Features */}
            <div className="mb-6">
              <h3 className="font-bold font-headline text-sm uppercase tracking-wider text-on-surface-variant mb-3">What&apos;s Included</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-tertiary text-base">check_circle</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery info */}
            <div className="bg-surface-container-low rounded-xl p-4 mb-6">
              {product.type === 'physical' ? (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">local_shipping</span>
                  <div>
                    <p className="font-bold text-sm font-headline">Physical Book — Delivered to You</p>
                    <p className="text-xs text-on-surface-variant">Delivery available across Rivers State and beyond. Distributors in major cities.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary">download</span>
                  <div>
                    <p className="font-bold text-sm font-headline">Digital Download — Instant Access</p>
                    <p className="text-xs text-on-surface-variant">Download immediately after payment. PDF format, read on any device.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Price + Quantity */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-3xl font-bold text-primary font-headline">₦{(product.price * quantity).toLocaleString()}</span>
                {quantity > 1 && (
                  <span className="text-sm text-on-surface-variant ml-2">
                    (₦{product.price.toLocaleString()} × {quantity})
                  </span>
                )}
              </div>
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
            </div>

            {/* Checkout Form */}
            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-headline flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                {product.type === 'physical' ? 'Order Now' : 'Buy & Download'}
              </button>
            ) : (
              <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow animate-fade-in-up">
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
                    placeholder="Phone number (for delivery)"
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed font-headline flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      'Redirecting to payment...'
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">lock</span>
                        Pay ₦{(product.price * quantity).toLocaleString()} with Flutterwave
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
                  <div className="h-44 relative">
                    <Image src={rp.image} alt={rp.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1 font-headline">{rp.category}</p>
                    <h3 className="font-bold font-headline mb-1">{rp.name}</h3>
                    <span className="text-lg font-bold text-primary font-headline">₦{rp.price.toLocaleString()}</span>
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
