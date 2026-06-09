'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid, { CMSProduct } from '@/components/store/ProductGrid';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';

export default function DigitalStorePage() {
  const [products, setProducts] = useState<CMSProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createBrowserClient();
        const { data, error: sbError } = await supabase
          .from('products')
          .select('*')
          .eq('category', 'digital')
          .eq('in_stock', true)
          .order('sort_order', { ascending: true });

        if (sbError) {
          console.error('[digital] Supabase error:', sbError);
          setError(sbError.message);
        } else {
          setProducts((data as CMSProduct[]) || []);
        }
      } catch (err: any) {
        console.error('[digital] Network error:', err);
        setError(err?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 px-6 md:px-8 max-w-screen-xl mx-auto min-h-screen">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-on-surface font-medium">Digital Storybooks &amp; Resources</span>
        </div>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-secondary-container/30 text-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-headline mb-4">
            <span className="material-symbols-outlined text-[14px]">auto_stories</span>
            Digital Downloads — Read Anywhere
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-3">Digital Storybooks &amp; Resources</h1>
          <p className="text-on-surface-variant max-w-lg text-lg">
            Affordable Christian and educational storybooks for children.
            Purchase, download instantly, and read on any device or print at home.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">bolt</span>
            <div>
              <p className="font-bold text-sm font-headline">Instant Download</p>
              <p className="text-xs text-on-surface-variant">Access immediately after payment</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary">devices</span>
            <div>
              <p className="font-bold text-sm font-headline">Read Anywhere</p>
              <p className="text-xs text-on-surface-variant">Phone, tablet, or print at home</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">savings</span>
            <div>
              <p className="font-bold text-sm font-headline">Affordable Pricing</p>
              <p className="text-xs text-on-surface-variant">Great value for families</p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-20 text-on-surface-variant">Loading products…</div>
        )}

        {!loading && error && (
          <div className="bg-error-container/20 border border-error/20 rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-3xl text-error mb-2 block">warning</span>
            <p className="font-bold text-error mb-1">Could not load products</p>
            <p className="text-sm text-on-surface-variant">{error}</p>
            <p className="text-xs text-on-surface-variant mt-3">
              If this persists, make sure the Supabase <code className="bg-surface-container-high px-1 rounded">products</code> table exists and has public read access enabled.
            </p>
          </div>
        )}

        {!loading && !error && <ProductGrid products={products} />}

        <div className="mt-16 bg-surface-container-low rounded-xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold font-headline mb-2">Want hands-on learning materials?</h3>
            <p className="text-on-surface-variant">Check out our physical workbooks and printable homeschooling packs.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/store/workbooks" className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full font-bold text-sm font-headline hover:scale-105 transition-all">School WorkBooks</Link>
            <Link href="/store/homeschooling" className="bg-surface-container-lowest text-primary px-6 py-2.5 rounded-full font-bold text-sm font-headline hover:scale-105 transition-all border border-outline-variant/20">Homeschooling</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
