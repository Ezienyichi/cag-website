'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  category: string;
  is_active: boolean;
  is_featured: boolean;
  stock_count: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (amount: number, currency = 'NGN') =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-headline">Products</h1>
        <p className="text-on-surface-variant text-sm">
          Manage products directly in Supabase Table Editor for full CRUD.
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Name</th>
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Slug</th>
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Category</th>
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Price</th>
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Stock</th>
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}>
                    <td className="px-6 py-4 font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-on-surface-variant font-mono text-xs">{p.slug}</td>
                    <td className="px-6 py-4">
                      <span className="bg-secondary-container/30 text-secondary px-3 py-1 rounded-full text-xs font-bold capitalize">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">{formatPrice(p.price, p.currency)}</td>
                    <td className="px-6 py-4">{p.stock_count}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          p.is_active
                            ? 'bg-tertiary-container/30 text-tertiary'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
