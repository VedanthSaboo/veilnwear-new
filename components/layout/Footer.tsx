// components/layout/Footer.tsx
import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-neutral-800 mt-8">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
        <p>© {new Date().getFullYear()} Veilnwear. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-neutral-200">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-neutral-200">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
