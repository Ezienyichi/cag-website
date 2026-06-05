'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [deliveryType, setDeliveryType] = useState<string>('physical');
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    const txRef = searchParams.get('tx_ref');
    const trxStatus = searchParams.get('status');
    const transactionId = searchParams.get('transaction_id');

    async function verify() {
      if (trxStatus === 'cancelled') { setStatus('failed'); return; }

      if (trxStatus === 'successful' && transactionId) {
        try {
          const res = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transaction_id: transactionId, tx_ref: txRef }),
          });
          const data = await res.json();
          if (data.success) {
            clearCart();
            setOrderId(data.orderId || null);
            setDeliveryType(data.deliveryType || 'physical');
            setStatus('success');

            // Auto-redirect digital products after a short delay
            if (data.orderId && data.deliveryType === 'download') {
              setTimeout(() => router.push(`/store/download/${data.orderId}`), 2500);
            } else if (data.orderId && data.deliveryType === 'read_online') {
              setTimeout(() => router.push(`/store/read/${data.orderId}`), 2500);
            }
          } else {
            setStatus('failed');
          }
        } catch { setStatus('failed'); }
      } else if (txRef) {
        clearCart();
        setStatus('success');
      } else {
        setStatus('failed');
      }
    }

    verify();
  }, [searchParams, clearCart, router]);

  return (
    <>
      {status === 'verifying' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="material-symbols-outlined text-3xl text-primary">hourglass_top</span>
          </div>
          <h1 className="text-2xl font-bold font-headline mb-2">Verifying Payment…</h1>
          <p className="text-on-surface-variant">Please wait while we confirm your transaction.</p>
        </div>
      )}

      {status === 'success' && deliveryType === 'physical' && (
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 bg-tertiary-container rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-on-tertiary-container">check_circle</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">Order Confirmed!</h1>
          <p className="text-on-surface-variant text-lg mb-8">
            Thank you for your purchase. We&apos;ll process your order and deliver it to you.
            You&apos;ll receive a confirmation email shortly.
          </p>
          <Link href="/" className="bg-primary-container text-on-primary-container px-8 py-3 rounded-full font-bold font-headline hover:scale-105 transition-transform inline-block">
            Back to Home
          </Link>
        </div>
      )}

      {status === 'success' && deliveryType === 'download' && (
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 bg-primary-container/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-primary">download_done</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">Payment Confirmed!</h1>
          <p className="text-on-surface-variant text-lg mb-2">Your file is ready. Redirecting to download page…</p>
          <p className="text-on-surface-variant text-sm mb-8">If not redirected automatically, use the button below.</p>
          {orderId && (
            <Link
              href={`/store/download/${orderId}`}
              className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold font-headline hover:scale-105 transition-transform inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined">download</span>
              Go to Download Page
            </Link>
          )}
        </div>
      )}

      {status === 'success' && deliveryType === 'read_online' && (
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 bg-secondary-container/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-secondary">menu_book</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">Payment Confirmed!</h1>
          <p className="text-on-surface-variant text-lg mb-2">Your book is ready. Redirecting to reader…</p>
          <p className="text-on-surface-variant text-sm mb-8">If not redirected automatically, use the button below.</p>
          {orderId && (
            <Link
              href={`/store/read/${orderId}`}
              className="bg-secondary text-on-secondary px-8 py-3 rounded-full font-bold font-headline hover:scale-105 transition-transform inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined">menu_book</span>
              Open Reader
            </Link>
          )}
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
            <p className="text-on-surface-variant">Loading…</p>
          </div>
        }>
          <VerifyContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
