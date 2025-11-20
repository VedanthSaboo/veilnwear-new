// layouts/Layout.tsx
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-white">
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
