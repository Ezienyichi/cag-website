'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const formatPrice = (amount: number, currency = 'NGN') =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0 || !email) return;
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerEmail: email,
          customerName: name,
        }),
      });

      const data = await res.json();

      if (data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        toast.error(data.error || 'Checkout failed');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 px-6 md:px-8 max-w-screen-xl mx-auto min-h-screen">
        <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">
              shopping_cart
            </span>
            <p className="text-xl text-on-surface-variant mb-6">Your cart is empty</p>
            <Link
              href="/#collection"
              className="bg-primary-container text-on-primary-container px-8 py-3 rounded-full font-bold font-headline hover:scale-105 transition-transform inline-block"
            >
              Browse Collection
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-surface-container-lowest rounded-xl p-4 md:p-6 flex gap-4 md:gap-6 items-center ambient-shadow"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden relative shrink-0">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold font-headline text-base md:text-lg truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-primary font-bold text-sm mt-1">
                      {formatPrice(item.product.price, item.product.currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="p-2 hover:bg-error-container/10 rounded-full transition-colors text-outline-variant hover:text-error"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 ambient-shadow h-fit sticky top-28">
              <h2 className="text-xl font-bold font-headline mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.product.price * item.quantity, item.product.currency)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-outline-variant/15 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>

              {!showCheckoutForm ? (
                <button
                  onClick={() => setShowCheckoutForm(true)}
                  className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all font-headline"
                >
                  Proceed to Checkout
                </button>
              ) : (
                <form onSubmit={handleCheckout} className="space-y-3 animate-fade-in-up">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all text-sm"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed font-headline flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      'Redirecting to Flutterwave...'
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">lock</span>
                        Pay with Flutterwave
                      </>
                    )}
                  </button>
                </form>
              )}

              <button
                onClick={clearCart}
                className="w-full text-on-surface-variant text-sm mt-3 py-2 hover:text-error transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
