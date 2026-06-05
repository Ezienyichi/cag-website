'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ReaderPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [productName, setProductName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/store/access/${orderId}`);
        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(data.error || 'Access denied');
          setStatus('error');
          return;
        }

        if (data.delivery_type !== 'read_online') {
          setErrorMsg('This order is not a read-online product.');
          setStatus('error');
          return;
        }

        setProductName(data.name);
        setFileUrl(data.file_url);
        setStatus('ready');
      } catch {
        setErrorMsg('Failed to load your book. Please try again.');
        setStatus('error');
      }
    }
    load();
  }, [orderId]);

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-0 min-h-screen flex flex-col">
        {status === 'loading' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <span className="material-symbols-outlined text-3xl text-secondary">hourglass_top</span>
              </div>
              <p className="text-on-surface-variant">Loading your book…</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-error-container/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-error">lock</span>
              </div>
              <h1 className="text-2xl font-bold font-headline mb-3">Access Denied</h1>
              <p className="text-on-surface-variant mb-6">{errorMsg}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/" className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-bold font-headline">Go Home</Link>
                <a href="mailto:admin@changeartgallerie.com" className="bg-surface-container-low text-primary px-6 py-3 rounded-full font-bold font-headline">Contact Support</a>
              </div>
            </div>
          </div>
        )}

        {status === 'ready' && (
          <>
            {/* Reader header */}
            <div className="bg-surface-container-lowest px-6 py-3 flex items-center justify-between border-b border-outline-variant/10 sticky top-24 z-40">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">menu_book</span>
                <div>
                  <p className="font-bold text-sm font-headline">{productName}</p>
                  <p className="text-xs text-on-surface-variant">Read Online — Change Art Gallerie</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-secondary-container/30 text-secondary px-3 py-1 rounded-full text-xs font-bold">
                  Read Only
                </span>
              </div>
            </div>

            {/* PDF Viewer */}
            {/* Right-click disabled on the container to discourage casual downloading */}
            <div
              className="flex-1 bg-surface-container-low"
              onContextMenu={(e) => e.preventDefault()}
            >
              <iframe
                src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                title={productName}
                className="w-full border-0"
                style={{ height: 'calc(100vh - 160px)', minHeight: 600 }}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>

            {/* Footer bar */}
            <div className="bg-surface-container-lowest px-6 py-3 border-t border-outline-variant/10 flex items-center justify-between">
              <p className="text-xs text-on-surface-variant">
                This content is protected. Downloading is not permitted.
              </p>
              <Link href="/store/digital" className="text-xs text-primary font-bold hover:underline underline-offset-4">
                Browse more books →
              </Link>
            </div>
          </>
        )}
      </main>
      {status !== 'ready' && <Footer />}
    </>
  );
}
