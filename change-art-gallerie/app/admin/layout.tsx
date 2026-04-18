'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const key = sessionStorage.getItem('admin_key');
    if (key) setAuthenticated(true);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // In production, replace with Supabase Auth
    sessionStorage.setItem('admin_key', password);
    setAuthenticated(true);
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="bg-surface-container-lowest rounded-xl p-8 md:p-10 max-w-sm w-full ambient-shadow">
          <h1 className="text-2xl font-bold font-headline mb-2">Admin Login</h1>
          <p className="text-on-surface-variant text-sm mb-6">
            Enter your service role key to access the dashboard.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Service role key"
              className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all"
              required
            />
            <button
              type="submit"
              className="w-full bg-primary-container text-on-primary-container py-3 rounded-full font-bold font-headline"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Admin nav */}
      <header className="bg-surface-container-lowest ambient-shadow sticky top-0 z-50">
        <nav className="max-w-screen-2xl mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold font-headline text-on-surface">
              CAG Admin
            </Link>
            <div className="hidden md:flex gap-4 text-sm font-medium">
              <Link href="/admin" className="text-primary font-bold">Dashboard</Link>
              <Link href="/admin/orders" className="text-on-surface-variant hover:text-primary transition-colors">Orders</Link>
              <Link href="/admin/waitlist" className="text-on-surface-variant hover:text-primary transition-colors">Waitlist</Link>
              <Link href="/admin/products" className="text-on-surface-variant hover:text-primary transition-colors">Products</Link>
            </div>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem('admin_key');
              setAuthenticated(false);
            }}
            className="text-sm text-on-surface-variant hover:text-error transition-colors"
          >
            Logout
          </button>
        </nav>
      </header>
      <main className="max-w-screen-2xl mx-auto px-6 md:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
