'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/store/ProductGrid';
import { getProductsByStore } from '@/lib/products';
import Link from 'next/link';

export default function WorkbooksStorePage() {
  const products = getProductsByStore('workbooks');

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 px-6 md:px-8 max-w-screen-xl mx-auto min-h-screen">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-on-surface font-medium">School WorkBooks</span>
        </div>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary-container/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-headline mb-4">
            <span className="material-symbols-outlined text-[14px]">menu_book</span>
            Physical Books — Delivered to You
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-3">School WorkBooks</h1>
          <p className="text-on-surface-variant max-w-lg text-lg">
            Montessori-approved creative arts workbooks for Nursery 1, 2 &amp; 3.
            Each book includes YouTube practice videos and assignment allocation record sheets.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            <div>
              <p className="font-bold text-sm font-headline">Delivery Available</p>
              <p className="text-xs text-on-surface-variant">Across Rivers State &amp; beyond</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary">play_circle</span>
            <div>
              <p className="font-bold text-sm font-headline">YouTube Videos Included</p>
              <p className="text-xs text-on-surface-variant">Exclusive practice classes</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">groups</span>
            <div>
              <p className="font-bold text-sm font-headline">Bulk Orders Welcome</p>
              <p className="text-xs text-on-surface-variant">Schools &amp; distributors</p>
            </div>
          </div>
        </div>

        <ProductGrid products={products} />

        <div className="mt-16 bg-surface-container-low rounded-xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold font-headline mb-2">Looking for digital resources?</h3>
            <p className="text-on-surface-variant">We also have downloadable homeschooling materials and digital storybooks.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/store/homeschooling" className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full font-bold text-sm font-headline hover:scale-105 transition-all">Homeschooling</Link>
            <Link href="/store/digital" className="bg-surface-container-lowest text-primary px-6 py-2.5 rounded-full font-bold text-sm font-headline hover:scale-105 transition-all border border-outline-variant/20">Digital Books</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
