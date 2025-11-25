// components/admin/AdminLayout.tsx
import React from 'react';
import Link from 'next/link';

export interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-[70vh] gap-6 py-6">
      {/* Sidebar */}
      <aside className="hidden w-56 flex-shrink-0 flex-col rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 text-sm text-neutral-200 md:flex">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Admin
        </h2>
        <nav className="flex flex-col gap-2">
          <Link
            href="/admin"
            className="rounded-md px-2 py-1 text-xs uppercase tracking-[0.18em] text-neutral-300 hover:bg-neutral-900"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="rounded-md px-2 py-1 text-xs uppercase tracking-[0.18em] text-neutral-300 hover:bg-neutral-900"
          >
            Products
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-md px-2 py-1 text-xs uppercase tracking-[0.18em] text-neutral-300 hover:bg-neutral-900"
          >
            Orders
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
