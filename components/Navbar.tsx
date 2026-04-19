'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalItems = useCartStore((s) => s.getTotalItems());

  return (
    <header className="fixed top-0 w-full z-50 frosted-nav ambient-shadow">
      <nav className="flex justify-between items-center px-6 md:px-8 py-4 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Change Art Gallerie"
            width={120}
            height={69}
            className="h-12 md:h-14 w-auto"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 items-center font-headline font-bold text-sm tracking-tight">
          <Link
            href="/#collection"
            className="text-primary border-b-2 border-primary-container pb-1"
          >
            Collection
          </Link>
          <Link
            href="/store/workbooks"
            className="text-on-surface hover:text-primary transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/#benefits"
            className="text-on-surface hover:text-primary transition-colors"
          >
            Resources
          </Link>
          <Link
            href="/about"
            className="text-on-surface hover:text-primary transition-colors"
          >
            About
          </Link>
          <Link
            href="/#testimonials"
            className="text-on-surface hover:text-primary transition-colors"
          >
            Testimonials
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative p-2 hover:bg-surface-container-low rounded-full transition-all"
          >
            <span className="material-symbols-outlined text-on-surface">shopping_cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-container text-white text-xs font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <a
            href="/waitlist"
            className="bg-primary-container text-on-primary-container px-5 py-2 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all font-headline"
          >
            Waitlist
          </a>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 hover:bg-surface-container-low rounded-full"
          >
            <span className="material-symbols-outlined">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-container-lowest px-6 pb-6 pt-2 border-t border-outline-variant/10 animate-fade-in-up">
          <div className="flex flex-col gap-4 font-headline font-bold text-base">
            <Link href="/#collection" onClick={() => setMobileOpen(false)} className="py-2 text-primary">Collection</Link>
            <Link href="/#benefits" onClick={() => setMobileOpen(false)} className="py-2 text-on-surface">Resources</Link>
            <Link href="/about" onClick={() => setMobileOpen(false)} className="py-2 text-on-surface">About</Link>
            <Link href="/#testimonials" onClick={() => setMobileOpen(false)} className="py-2 text-on-surface">Testimonials</Link>
            <a href="/waitlist" onClick={() => setMobileOpen(false)} className="py-2 text-primary">Join Waitlist</a>
          </div>
        </div>
      )}
    </header>
  );
}
