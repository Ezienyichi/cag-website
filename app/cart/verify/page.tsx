'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function VerifyContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    const txRef = searchParams.get('tx_ref');
    const trxStatus = searchParams.get('status');
    const transactionId = searchParams.get('transaction_id');

    if (trxStatus === 'successful' && transactionId) {
      fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: transactionId, tx_ref: txRef }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStatus('success');
            clearCart();
          } else {
            setStatus('failed');
          }
        })
        .catch(() => setStatus('failed'));
    } else if (trxStatus === 'cancelled') {
      setStatus('failed');
    } else {
      if (txRef) {
        setStatus('success');
        clearCart();
      } else {
        setStatus('failed');
      }
    }
  }, [searchParams, clearCart]);

  return (
    <>
      {status === 'verifying' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="material-symbols-outlined text-3xl text-primary">hourglass_top</span>
          </div>
          <h1 className="text-2xl font-bold font-headline mb-2">Verifying Payment...</h1>
          <p className="text-on-surface-variant">Please wait while we confirm your transaction.</p>
        </div>
      )}
      {status === 'success' && (
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 bg-tertiary-container rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-on-tertiary-container">check_circle</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">Order Confirmed!</h1>
          <p className="text-on-surface-variant text-lg mb-8">
            Thank you for your purchase. You&apos;ll receive a confirmation email shortly with your order details.
          </p>
          <Link href="/" className="bg-primary-container text-on-primary-container px-8 py-3 rounded-full font-bold font-headline hover:scale-105 transition-transform inline-block">
            Back to Home
          </Link>
        </div>
      )}
      {status === 'failed' && (
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 bg-error-container/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-error">error</span>
          </div>
          <h1 className="text-3xl font-bold font-headline mb-4">Payment Issue</h1>
          <p className="text-on-surface-variant text-lg mb-8">
            Your payment could not be verified. If money was deducted, please contact us and we&apos;ll resolve it promptly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cart" className="bg-primary-container text-on-primary-container px-8 py-3 rounded-full font-bold font-headline">Try Again</Link>
            <a href="mailto:admin@changeartgallerie.com" className="bg-surface-container-low text-primary px-8 py-3 rounded-full font-bold font-headline">Contact Support</a>
          </div>
        </div>
      )}
    </>
  );
}

export default function VerifyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 px-6 md:px-8 max-w-screen-xl mx-auto min-h-screen flex items-center justify-center">
        <Suspense fallback={
          <div className="text-center">
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <span className="material-symbols-outlined text-3xl text-primary">hourglass_top</span>
            </div>
            <p className="text-on-surface-variant">Loading...</p>
          </div>
        }>
          <VerifyContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}