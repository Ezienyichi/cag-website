'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/products', label: 'Products', icon: 'inventory_2' },
  { href: '/admin/orders', label: 'Orders', icon: 'receipt_long' },
  { href: '/admin/waitlist', label: 'Waitlist', icon: 'people' },
  { href: '/admin/books', label: 'Book Pages', icon: 'menu_book' },
  { href: '/admin/gallery', label: 'Gallery & Testimonials', icon: 'photo_library' },
  { href: '/admin/faqs', label: 'FAQs', icon: 'quiz' },
  { href: '/admin/settings', label: 'Settings', icon: 'settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const key = sessionStorage.getItem('admin_key');
    if (key) setAuthenticated(true);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        sessionStorage.setItem('admin_key', data.token);
        setAuthenticated(true);
      } else {
        setLoginError(data.error || 'Incorrect password');
      }
    } catch {
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="bg-surface-container-lowest rounded-xl p-8 md:p-10 max-w-sm w-full ambient-shadow">
          <div className="w-12 h-12 bg-primary-container/20 rounded-xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-2xl text-primary">lock</span>
          </div>
          <h1 className="text-2xl font-bold font-headline mb-2">Admin Login</h1>
          <p className="text-on-surface-variant text-sm mb-6">
            Enter your admin password to access the dashboard.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 bg-surface-container-high rounded-lg ghost-border-focus transition-all"
                required
                autoFocus
              />
            </div>
            {loginError && (
              <p className="text-sm text-error bg-error-container/20 px-3 py-2 rounded-lg">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-primary-container text-on-primary-container py-3 rounded-full font-bold font-headline disabled:opacity-60"
            >
              {loggingIn ? 'Verifying…' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Top header */}
      <header className="bg-surface-container-lowest ambient-shadow sticky top-0 z-50">
        <nav className="max-w-screen-2xl mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold font-headline text-on-surface">
              CAG Admin
            </Link>
            {/* Desktop nav */}
            <div className="hidden lg:flex gap-1 text-sm font-medium flex-wrap">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-full transition-colors font-headline ${
                    isActive(link.href)
                      ? 'bg-primary-container/30 text-primary font-bold'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">
                {mobileNavOpen ? 'close' : 'menu'}
              </span>
            </button>

            <button
              onClick={() => {
                sessionStorage.removeItem('admin_key');
                setAuthenticated(false);
              }}
              className="text-sm text-on-surface-variant hover:text-error transition-colors hidden md:block"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-outline-variant/10 px-6 py-4 grid grid-cols-3 gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors text-center ${
                  isActive(link.href)
                    ? 'bg-primary-container/30 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{link.icon}</span>
                <span className="text-xs font-medium font-headline">{link.label}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                sessionStorage.removeItem('admin_key');
                setAuthenticated(false);
              }}
              className="flex flex-col items-center gap-1 p-3 rounded-xl text-error hover:bg-error-container/10 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span className="text-xs font-medium font-headline">Logout</span>
            </button>
          </div>
        )}
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 md:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
