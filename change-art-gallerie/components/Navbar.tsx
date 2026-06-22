'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const totalItems = useCartStore((s) => s.getTotalItems());

  function closeMobile() {
    setMobileOpen(false);
    setShopOpen(false);
  }

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
          <Link href="/#collection" className="text-primary border-b-2 border-primary-container pb-1">
            Collection
          </Link>

          {/* Shop with hover dropdown */}
          <div className="relative group">
            <button className="text-on-surface hover:text-primary transition-colors flex items-center gap-0.5 pb-1">
              Shop
              <span className="material-symbols-outlined text-[16px] group-hover:rotate-180 transition-transform duration-200">
                expand_more
              </span>
            </button>
            {/* Dropdown */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
              <div className="bg-surface-container-lowest rounded-xl p-2 ambient-shadow min-w-[190px] flex flex-col border border-outline-variant/10">
                <Link
                  href="/store"
                  className="px-4 py-2.5 rounded-lg hover:bg-surface-container-high text-sm font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">storefront</span>
                  View All
                </Link>
                <div className="border-t border-surface-container-high my-1" />
                <Link
                  href="/store/workbooks"
                  className="px-4 py-2.5 rounded-lg hover:bg-surface-container-high text-sm font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base text-primary">menu_book</span>
                  Workbooks
                </Link>
                <Link
                  href="/store/homeschooling"
                  className="px-4 py-2.5 rounded-lg hover:bg-surface-container-high text-sm font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base text-tertiary">home</span>
                  Homeschooling
                </Link>
                <Link
                  href="/store/digital"
                  className="px-4 py-2.5 rounded-lg hover:bg-surface-container-high text-sm font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base text-secondary">auto_stories</span>
                  Digital Books
                </Link>
                <div className="border-t border-surface-container-high my-1" />
                <Link
                  href="/resources"
                  className="px-4 py-2.5 rounded-lg hover:bg-surface-container-high text-sm font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base text-tertiary">card_giftcard</span>
                  Free Resources
                </Link>
              </div>
            </div>
          </div>

          <Link href="/about" className="text-on-surface hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/gallery" className="text-on-surface hover:text-primary transition-colors">
            Gallery
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative p-2 hover:bg-surface-container-low rounded-full transition-all">
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
          <div className="flex flex-col font-headline font-bold text-base">
            <Link href="/" onClick={closeMobile} className="py-3 text-on-surface border-b border-outline-variant/10">
              Home
            </Link>

            {/* Shop with expandable sub-links */}
            <div className="border-b border-outline-variant/10">
              <button
                onClick={() => setShopOpen(!shopOpen)}
                className="w-full flex items-center justify-between py-3 text-on-surface"
              >
                Shop
                <span className={`material-symbols-outlined text-base transition-transform duration-200 ${shopOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              {shopOpen && (
                <div className="flex flex-col gap-1 pl-4 pb-3">
                  <Link
                    href="/store"
                    onClick={closeMobile}
                    className="py-2 text-sm text-primary flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">storefront</span>
                    View All
                  </Link>
                  <div className="border-t border-outline-variant/10 my-1" />
                  <Link
                    href="/store/workbooks"
                    onClick={closeMobile}
                    className="py-2 text-sm text-primary flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">menu_book</span>
                    Workbooks
                  </Link>
                  <Link
                    href="/store/homeschooling"
                    onClick={closeMobile}
                    className="py-2 text-sm text-primary flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">home</span>
                    Homeschooling
                  </Link>
                  <Link
                    href="/store/digital"
                    onClick={closeMobile}
                    className="py-2 text-sm text-primary flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">auto_stories</span>
                    Digital Books
                  </Link>
                  <div className="border-t border-outline-variant/10 my-1" />
                  <Link
                    href="/resources"
                    onClick={closeMobile}
                    className="py-2 text-sm text-primary flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">card_giftcard</span>
                    Free Resources
                  </Link>
                </div>
              )}
            </div>

            <Link href="/#collection" onClick={closeMobile} className="py-3 text-on-surface border-b border-outline-variant/10">
              Collection
            </Link>
            <Link href="/about" onClick={closeMobile} className="py-3 text-on-surface border-b border-outline-variant/10">
              About
            </Link>
            <Link href="/gallery" onClick={closeMobile} className="py-3 text-on-surface border-b border-outline-variant/10">
              Gallery
            </Link>
            <a href="/waitlist" onClick={closeMobile} className="py-3 text-primary">
              Join Waitlist
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
