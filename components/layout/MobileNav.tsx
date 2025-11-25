// components/layout/MobileNav.tsx
import React from 'react';
import Link from 'next/link';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <aside className="fixed inset-0 z-50 bg-black/70 md:hidden">
      <div className="absolute right-0 top-0 h-full w-64 bg-neutral-950 border-l border-neutral-800 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-semibold tracking-[0.2em] uppercase">
            Menu
          </span>
          <button
            type="button"
            className="text-neutral-400 hover:text-neutral-200 text-sm"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-3 text-sm text-neutral-200">
          <Link href="/shop" className="text-left hover:text-white" onClick={onClose}>
            Shop
          </Link>
          <Link href="/about" className="text-left hover:text-white" onClick={onClose}>
            About
          </Link>
          <Link href="/contact" className="text-left hover:text-white" onClick={onClose}>
            Contact
          </Link>
        </nav>
      </div>
    </aside>
  );
};

export default MobileNav;
