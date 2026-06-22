'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid, { CMSProduct } from '@/components/store/ProductGrid';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';

interface CategoryDef {
  value: string;
  label: string;
  icon: string;
  iconColor: string;
  href: string;
}

const CATEGORIES: CategoryDef[] = [
  { value: 'workbooks', label: 'Workbooks', icon: 'menu_book', iconColor: 'text-primary', href: '/store/workbooks' },
  { value: 'homeschooling', label: 'Homeschooling', icon: 'home', iconColor: 'text-tertiary', href: '/store/homeschooling' },
  { value: 'digital', label: 'Digital', icon: 'auto_stories', iconColor: 'text-secondary', href: '/store/digital' },
  { value: 'nursery1', label: 'Nursery 1', icon: 'child_care', iconColor: 'text-primary', href: '#nursery1' },
  { value: 'nursery2', label: 'Nursery 2', icon: 'child_care', iconColor: 'text-tertiary', href: '#nursery2' },
  { value: 'nursery3', label: 'Nursery 3', icon: 'child_care', iconColor: 'text-secondary', href: '#nursery3' },
  { value: 'art_supplies', label: 'Art Supplies', icon: 'palette', iconColor: 'text-primary', href: '#art_supplies' },
  { value: 'stationery', label: 'Stationery', icon: 'edit_note', iconColor: 'text-tertiary', href: '#stationery' },
  { value: 'bundles', label: 'Bundles & Kits', icon: 'inventory_2', iconColor: 'text-secondary', href: '#bundles' },
  { value: 'resources', label: 'Free Resources', icon: 'card_giftcard', iconColor: 'text-primary', href: '/resources' },
];

export default function StorePage() {
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
          .eq('in_stock', true)
          .order('sort_order', { ascending: true });

        if (sbError) {
          console.error('[store] Supabase error:', sbError);
          setError(sbError.message);
        } else {
          setProducts((data as CMSProduct[]) || []);
        }
      } catch (err: any) {
        console.error('[store] Network error:', err);
        setError(err?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const featured = products.filter(p => p.featured);
  const byCategory: Record<string, CMSProduct[]> = {};
  for (const p of products) {
    (byCategory[p.category] ||= []).push(p);
  }

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 px-6 md:px-8 max-w-screen-xl mx-auto min-h-screen">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-3">Our Store</h1>
          <p className="text-on-surface-variant max-w-lg text-lg">
            Browse everything Change Art Gallerie has to offer — workbooks, homeschooling packs, digital books, nursery sets, art supplies and more.
          </p>
        </div>

        {loading && (
          <div className="text-center py-20 text-on-surface-variant">Loading products…</div>
        )}

        {!loading && error && (
          <div className="bg-error-container/20 border border-error/20 rounded-xl p-6 text-center mb-10">
            <span className="material-symbols-outlined text-3xl text-error mb-2 block">warning</span>
            <p className="font-bold text-error mb-1">Could not load products</p>
            <p className="text-sm text-on-surface-variant">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Featured products, across all categories */}
            {featured.length > 0 && (
              <div className="mb-14">
                <h2 className="text-xl font-bold font-headline mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">star</span>
                  Featured Products
                </h2>
                <ProductGrid products={featured} />
              </div>
            )}

            {/* Category cards */}
            <div className="mb-14">
              <h2 className="text-xl font-bold font-headline mb-5">Shop by Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {CATEGORIES.map(c => {
                  const count = byCategory[c.value]?.length || 0;
                  return (
                    <Link
                      key={c.value}
                      href={c.href}
                      className="bg-surface-container-lowest rounded-xl p-5 ambient-shadow hover:scale-[1.03] transition-transform flex flex-col items-center text-center gap-2"
                    >
                      <span className={`material-symbols-outlined text-3xl ${c.iconColor}`}>{c.icon}</span>
                      <span className="font-bold text-sm font-headline">{c.label}</span>
                      <span className="text-xs text-on-surface-variant">{count} product{count !== 1 ? 's' : ''}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* One section per category that has products */}
            {CATEGORIES.filter(c => byCategory[c.value]?.length).map(c => (
              <div key={c.value} id={c.value} className="mb-14 scroll-mt-28">
                <h2 className="text-xl font-bold font-headline mb-5 flex items-center gap-2">
                  <span className={`material-symbols-outlined ${c.iconColor}`}>{c.icon}</span>
                  {c.label}
                </h2>
                <ProductGrid products={byCategory[c.value]} />
              </div>
            ))}

            {products.length === 0 && (
              <div className="text-center py-20 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-3 block">inventory_2</span>
                <p className="font-medium">No products available yet. Check back soon!</p>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
