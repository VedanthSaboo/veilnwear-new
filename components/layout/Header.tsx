// components/layout/Header.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import MobileNav from './MobileNav';
import { FiMenu } from 'react-icons/fi';

const Header: React.FC = () => {
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const isActive = (path: string) => router.pathname === path;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-900 bg-neutral-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="sm:hidden text-neutral-300 hover:text-white"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <Link href="/" className="text-sm font-semibold tracking-[0.25em] text-neutral-50 uppercase">
            Veilnwear
          </Link>
        </div>

        {/* Center: Nav */}
        <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.2em] text-neutral-400 sm:flex">
          <Link
            href="/"
            className={isActive('/') ? 'text-neutral-50' : 'hover:text-neutral-100'}
          >
            Home
          </Link>
          <Link
            href="/shop"
            className={isActive('/shop') ? 'text-neutral-50' : 'hover:text-neutral-100'}
          >
            Shop
          </Link>
          <Link
            href="/about"
            className={isActive('/about') ? 'text-neutral-50' : 'hover:text-neutral-100'}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={isActive('/contact') ? 'text-neutral-50' : 'hover:text-neutral-100'}
          >
            Contact
          </Link>
        </nav>

        {/* Right: Auth + Cart */}
        <div className="flex items-center gap-4">
          {/* Auth actions */}
          {!firebaseUser && (
            <Link
              href="/login"
              className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-300 hover:text-neutral-50"
            >
              Login
            </Link>
          )}

          {firebaseUser && (
            <Link
              href="/profile"
              className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-300 hover:text-neutral-50"
            >
              My Account
            </Link>
          )}

          {/* Cart link (safe default; replace with your CartSidebar trigger if needed) */}
          <Link
            href="/cart"
            className="relative text-xs font-medium uppercase tracking-[0.18em] text-neutral-300 hover:text-neutral-50"
          >
            Cart
          </Link>
        </div>
      </div>
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </header>
  );
};

export default Header;
