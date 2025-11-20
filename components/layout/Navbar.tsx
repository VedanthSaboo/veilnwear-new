// components/layout/Navbar.tsx
import React from 'react';
import { FiShoppingBag } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';

export interface NavbarProps {
  onOpenMobileNav?: () => void;
  onOpenCart?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenMobileNav, onOpenCart }) => {
  const { cartCount } = useCart();

  return (
    <nav className="w-full px-4 py-3 border-t border-neutral-800">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="text-lg font-semibold tracking-[0.2em] uppercase">
          Veilnwear
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
          <button type="button" className="hover:text-white">
            Shop
          </button>
          <button type="button" className="hover:text-white">
            About
          </button>
          <button type="button" className="hover:text-white">
            Contact
          </button>
        </div>

        {/* Right side: cart + mobile menu */}
        <div className="flex items-center gap-3">
          {/* Cart button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative inline-flex items-center justify-center rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:border-neutral-400"
          >
            <FiShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="ml-1 rounded-full bg-neutral-50 px-2 py-0.5 text-[10px] font-semibold text-neutral-950">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200"
            onClick={onOpenMobileNav}
          >
            Menu
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
