// pages/admin/orders/index.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import AdminLayout from '@/components/admin/AdminLayout';
import { withAdminAuth } from '@/components/admin/withAdminAuth';
import { useAuth } from '@/context/AuthContext';

type OrderItemSnapshot = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
};

type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type AdminOrder = {
  id: string;
  userId: string;
  items: OrderItemSnapshot[];
  totalPrice: number;
  shippingAddress: ShippingAddress;
  status: string;
  paymentMethod: string;
  isPaid: boolean;
  createdAt: string;
};

interface ApiResponse {
  orders: AdminOrder[];
}

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

const formatPrice = (priceInCents: number): string => {
  const rupees = priceInCents / 100;
  return `₹${rupees.toFixed(2)}`;
};

const AdminOrdersPageBase: NextPage = () => {
  const { firebaseUser } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!firebaseUser) return;

    try {
      setLoading(true);
      setError(null);

      const token = await firebaseUser.getIdToken();

      const res = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = (data as any).message || 'Failed to load orders.';
        throw new Error(message);
      }

      const data: ApiResponse = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      console.error('Admin orders fetch error:', err);
      setError(err.message || 'Failed to load orders.');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firebaseUser) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!firebaseUser) {
      toast.error('You must be logged in as admin to update orders.');
      return;
    }

    try {
      setUpdatingId(orderId);

      const token = await firebaseUser.getIdToken();

      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = (data as any).message || 'Failed to update order.';
        throw new Error(message);
      }

      const updated = await res.json();
      const updatedOrder = (updated as { order: AdminOrder }).order;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: updatedOrder.status } : o,
        ),
      );

      toast.success('Order status updated.');
    } catch (err: any) {
      console.error('Update order status error:', err);
      toast.error(err.message || 'Failed to update order.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Orders | Veilnwear</title>
        <meta
          name="description"
          content="View and manage orders in the Veilnwear admin panel."
        />
      </Head>

      <AdminLayout>
        <header className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Admin
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-50">
            Orders
          </h1>
          <p className="text-sm text-neutral-400">
            View all customer orders and update their status.
          </p>
        </header>

        {loading ? (
          <div className="flex min-h-[150px] items-center justify-center">
            <p className="text-sm text-neutral-400">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-[150px] items-center justify-center rounded-lg border border-dashed border-neutral-800 bg-neutral-950/60">
            <p className="text-sm text-neutral-400">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-800">
            <table className="min-w-full text-left text-sm text-neutral-200">
              <thead className="bg-neutral-950/80 text-xs uppercase tracking-[0.18em] text-neutral-400">
                <tr>
                  <th className="px-3 py-3">Order ID</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Items</th>
                  <th className="px-3 py-3">Total</th>
                  <th className="px-3 py-3">Payment</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 bg-neutral-950/70">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-3 py-3 align-top text-xs font-mono text-neutral-300">
                      {order.id}
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-neutral-300">
                      <div className="space-y-1">
                        <p>{order.shippingAddress.fullName}</p>
                        <p className="text-neutral-500">
                          {order.shippingAddress.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-neutral-300">
                      <div className="space-y-1 max-w-xs">
                        {order.items.map((item, idx) => (
                          <div key={`${item.productId}-${idx}`}>
                            <span className="text-neutral-100">
                              {item.name}
                            </span>{' '}
                            <span className="text-neutral-500">
                              × {item.quantity}
                              {item.size ? ` • Size ${item.size}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top text-sm text-neutral-100">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-neutral-300">
                      <div className="flex flex-col gap-1">
                        <span className="uppercase">{order.paymentMethod}</span>
                        <span
                          className={`inline-flex w-fit items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${order.isPaid
                              ? 'bg-green-950 text-green-400'
                              : 'bg-yellow-950 text-yellow-400'
                            }`}
                        >
                          {order.isPaid ? 'PAID' : 'UNPAID'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-neutral-200">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-neutral-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : '—'}
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

const AdminOrdersPage = withAdminAuth(AdminOrdersPageBase);

export default AdminOrdersPage;