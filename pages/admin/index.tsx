// pages/admin/index.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminLayout from '@/components/admin/AdminLayout';
import { withAdminAuth } from '@/components/admin/withAdminAuth';
import { useAuth } from '@/context/AuthContext';

type ProductsApiResponse = {
  products?: any[];
  message?: string;
};

const AdminDashboardPage: React.FC = () => {
  const { firebaseUser } = useAuth();
  const [productCount, setProductCount] = useState<number | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // If we have a firebaseUser, include the ID token in the Authorization header
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            headers.Authorization = `Bearer ${idToken}`;
          } catch (tokenErr) {
            console.error('Failed to get ID token', tokenErr);
            // proceed without token (will probably be blocked), but allow error to surface
          }
        }

        // Fetch products
        const productsRes = await fetch('/api/products', {
          method: 'GET',
          headers,
        });

        if (!productsRes.ok) {
          const bodyText = await productsRes.text().catch(() => '');
          let parsed: any = null;
          try {
            parsed = bodyText ? JSON.parse(bodyText) : null;
          } catch {
            parsed = bodyText;
          }
          throw new Error(parsed?.message ?? `Failed to load products. (${productsRes.status})`);
        }

        const productsData: ProductsApiResponse = await productsRes.json();
        if (!mounted) return;
        setProductCount(productsData.products?.length ?? 0);

        // Fetch orders count (admin-only)
        const ordersRes = await fetch('/api/orders', {
          method: 'GET',
          headers,
        });

        if (!ordersRes.ok) {
          const bodyText = await ordersRes.text().catch(() => '');
          let parsed: any = null;
          try {
            parsed = bodyText ? JSON.parse(bodyText) : null;
          } catch {
            parsed = bodyText;
          }
          throw new Error(parsed?.message ?? `Failed to load orders. (${ordersRes.status})`);
        }

        const ordersData = await ordersRes.json();
        if (!mounted) return;
        // If your /api/orders returns { orders: [...] } adapt this accordingly
        setOrderCount(ordersData.orders?.length || 0);
      } catch (err: any) {
        console.error('fetchDashboardData error', err);
        if (mounted) setError(err?.message ?? 'Failed to load dashboard data');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, [firebaseUser]);

  return (
    <>
      <Head>
        <title>Admin Dashboard - Veilnwear</title>
      </Head>

      <AdminLayout>
        <div className="max-w-5xl space-y-6 py-6">
          <h1 className="text-2xl font-semibold text-neutral-50">Admin Dashboard</h1>

          {loading ? (
            <div className="text-neutral-400">Loading dashboard...</div>
          ) : error ? (
            <div className="rounded-md border border-red-700 bg-red-950/20 p-3 text-sm text-red-200">
              <strong>Error:</strong> {error}
              <div className="mt-2 text-xs text-neutral-400">
                Check server console or network tab for details.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4">
                <div className="text-xs text-neutral-400">Products</div>
                <div className="mt-2 text-2xl font-bold text-neutral-100">
                  {productCount ?? '—'}
                </div>
              </div>

              <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4">
                <div className="text-xs text-neutral-400">Orders</div>
                <div className="mt-2 text-2xl font-bold text-neutral-100">
                  {orderCount ?? '—'}
                </div>
              </div>

              {/* placeholder card for future stats */}
              <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4">
                <div className="text-xs text-neutral-400">Revenue (est.)</div>
                <div className="mt-2 text-2xl font-bold text-neutral-100">—</div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default withAdminAuth(AdminDashboardPage);
