'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DownloadPage() {
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

        if (data.delivery_type !== 'download') {
          setErrorMsg('This order is not a downloadable product.');
          setStatus('error');
          return;
        }

        setProductName(data.name);
        setFileUrl(data.file_url);
        setStatus('ready');
      } catch {
        setErrorMsg('Failed to load your download. Please try again.');
        setStatus('error');
      }
    }
    load();
  }, [orderId]);

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 px-6 md:px-8 max-w-screen-xl mx-auto min-h-screen flex items-center justify-center">
        {status === 'loading' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <span className="material-symbols-outlined text-3xl text-primary">hourglass_top</span>
            </div>
            <p className="text-on-surface-variant">Verifying your purchase…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-error-container/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-error">lock</span>
            </div>
            <h1 className="text-2xl font-bold font-headline mb-3">Access Denied</h1>
            <p className="text-on-surface-variant mb-6">{errorMsg}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/" className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-bold font-headline">
                Go Home
              </Link>
              <a href="mailto:admin@changeartgallerie.com" className="bg-surface-container-low text-primary px-6 py-3 rounded-full font-bold font-headline">
                Contact Support
              </a>
            </div>
          </div>
        )}

        {status === 'ready' && (
          <div className="text-center max-w-lg w-full">
            {/* Success header */}
            <div className="w-24 h-24 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-5xl text-primary">download_done</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-headline mb-3">Your File is Ready!</h1>
            <p className="text-on-surface-variant text-lg mb-8">
              Thank you for purchasing <span className="font-bold text-on-surface">{productName}</span>.
              Click the button below to download your file.
            </p>

            {/* Download card */}
            <div className="bg-surface-container-lowest rounded-xl p-8 ambient-shadow mb-8">
              <div className="flex items-center gap-4 mb-6 text-left">
                <div className="w-14 h-14 bg-primary-container/20 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-3xl text-primary">description</span>
                </div>
                <div>
                  <p className="font-bold font-headline">{productName}</p>
                  <p className="text-xs text-on-surface-variant">Digital download — PDF format</p>
                </div>
              </div>

              <a
                href={fileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-lg font-headline flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined">download</span>
                Download Now
              </a>

              <p className="text-xs text-on-surface-variant mt-4">
                This link is unique to your order. Please save the file after downloading.
              </p>
            </div>

            {/* Tips */}
            <div className="bg-surface-container-low rounded-xl p-6 text-left space-y-3">
              <p className="font-bold text-sm font-headline">Tips for your download:</p>
              <div className="flex items-start gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-base text-tertiary mt-0.5">check_circle</span>
                Save the file to your device or cloud storage for permanent access.
              </div>
              <div className="flex items-start gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-base text-tertiary mt-0.5">check_circle</span>
                Open with any PDF reader (Adobe Acrobat, Google Drive, or your browser).
              </div>
              <div className="flex items-start gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-base text-tertiary mt-0.5">check_circle</span>
                You can return to this page using your original order URL.
              </div>
            </div>

            <div className="mt-8">
              <Link href="/store/workbooks" className="text-primary font-bold text-sm hover:underline underline-offset-4">
                Browse more books →
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
