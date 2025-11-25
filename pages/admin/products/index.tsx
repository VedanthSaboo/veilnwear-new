// pages/admin/products/index.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import AdminLayout from '@/components/admin/AdminLayout';
import { withAdminAuth } from '@/components/admin/withAdminAuth';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  stock: number;
  isFeatured: boolean;
  createdAt: string;
}

interface ApiResponse {
  products: AdminProduct[];
}

const formatPrice = (priceInCents: number): string => {
  const rupees = priceInCents / 100;
  return `₹${rupees.toFixed(2)}`;
};

const AdminProductsPageBase: NextPage = () => {
  const { firebaseUser } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers: Record<string, string> = {};
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch('/api/products', { headers });
      if (!res.ok) {
        throw new Error(`Failed to fetch products (${res.status})`);
      }

      const data: ApiResponse = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Admin products fetch error:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firebaseUser) {
      fetchProducts();
    }
  }, [firebaseUser]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    if (!firebaseUser) {
      toast.error('You must be logged in as admin to delete products.');
      return;
    }

    try {
      setDeletingId(id);
      const token = await firebaseUser.getIdToken();

      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = (data as any).message || 'Failed to delete product.';
        throw new Error(message);
      }

      toast.success('Product deleted.');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error: any) {
      console.error('Delete product error:', error);
      toast.error(error.message || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Products | Veilnwear</title>
        <meta
          name="description"
          content="View and manage products in the Veilnwear admin panel."
        />
      </Head>

      <AdminLayout>
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
              Admin
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-50">
              Products
            </h1>
            <p className="text-sm text-neutral-400">
              View and manage all products in your store.
            </p>
          </div>

          <Link href="/admin/products/new">
            <Button className="rounded-full border border-neutral-100 bg-neutral-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-950 hover:bg-white">
              New Product
            </Button>
          </Link>
        </header>

        {loading ? (
          <div className="flex min-h-[150px] items-center justify-center">
            <p className="text-sm text-neutral-400">Loading products...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-[150px] items-center justify-center rounded-lg border border-dashed border-neutral-800 bg-neutral-950/60">
            <p className="text-sm text-neutral-400">No products found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-800">
            <table className="min-w-full text-left text-sm text-neutral-200">
              <thead className="bg-neutral-950/80 text-xs uppercase tracking-[0.18em] text-neutral-400">
                <tr>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Price</th>
                  <th className="px-3 py-3">Stock</th>
                  <th className="px-3 py-3">Featured</th>
                  <th className="px-3 py-3">Slug</th>
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 bg-neutral-950/70">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-3 py-3 align-top">
                      <div className="max-w-xs">
                        <p className="font-medium text-neutral-50 line-clamp-2">
                          {product.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top text-neutral-300">
                      {product.category}
                    </td>
                    <td className="px-3 py-3 align-top text-neutral-200">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-3 py-3 align-top text-neutral-200">
                      {product.stock}
                    </td>
                    <td className="px-3 py-3 align-top text-neutral-200">
                      {product.isFeatured ? 'Yes' : 'No'}
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-neutral-400 break-all">
                      {product.slug}
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-neutral-400">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-neutral-500">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-200 hover:border-neutral-400"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="rounded-full border border-red-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-red-300 hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === product.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

const AdminProductsPage = withAdminAuth(AdminProductsPageBase);

export default AdminProductsPage;

