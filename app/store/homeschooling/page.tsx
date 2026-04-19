'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/store/ProductGrid';
import { getProductsByStore } from '@/lib/products';
import Link from 'next/link';

export default function HomeschoolingStorePage() {
  const products = getProductsByStore('homeschooling');

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 px-6 md:px-8 max-w-screen-xl mx-auto min-h-screen">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-on-surface font-medium">Home Schooling Resources</span>
        </div>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-tertiary-container/30 text-tertiary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-headline mb-4">
            <span className="material-symbols-outlined text-[14px]">download</span>
            Digital Downloads — Instant Access
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-3">Home Schooling Resources</h1>
          <p className="text-on-surface-variant max-w-lg text-lg">
            Downloadable activity packs, worksheets, and lesson plans for homeschooling your kids ages 2 to 6.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">shopping_cart</span>
            <div>
              <p className="font-bold text-sm font-headline">1. Purchase</p>
              <p className="text-xs text-on-surface-variant">Pay securely with Flutterwave</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary">download</span>
            <div>
              <p className="font-bold text-sm font-headline">2. Download</p>
              <p className="text-xs text-on-surface-variant">Get instant access to files</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">print</span>
            <div>
              <p className="font-bold text-sm font-headline">3. Print &amp; Learn</p>
              <p className="text-xs text-on-surface-variant">Print at home, start learning</p>
            </div>
          </div>
        </div>

        <ProductGrid products={products} />

        <div className="mt-16 bg-surface-container-low rounded-xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold font-headline mb-2">Want physical workbooks instead?</h3>
            <p className="text-on-surface-variant">Our Montessori school workbooks are delivered right to your door.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/store/workbooks" className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full font-bold text-sm font-headline hover:scale-105 transition-all">School WorkBooks</Link>
            <Link href="/store/digital" className="bg-surface-container-lowest text-primary px-6 py-2.5 rounded-full font-bold text-sm font-headline hover:scale-105 transition-all border border-outline-variant/20">Digital Storybooks</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
