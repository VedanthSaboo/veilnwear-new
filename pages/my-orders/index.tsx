// pages/my-orders/index.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

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

type OrderSummary = {
  id: string;
  items: OrderItemSnapshot[];
  totalPrice: number;
  shippingAddress: ShippingAddress;
  status: string;
  paymentMethod: string;
  isPaid: boolean;
  createdAt: string;
};

interface ApiResponse {
  orders: OrderSummary[];
}

const formatPrice = (priceInCents: number): string => {
  const rupees = priceInCents / 100;
  return `₹${rupees.toFixed(2)}`;
};

const MyOrdersPage: NextPage = () => {
  const { firebaseUser, appUser, loading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!firebaseUser) return;

    try {
      setFetching(true);
      setError(null);

      const token = await firebaseUser.getIdToken();

      const res = await fetch('/api/orders/my-orders', {
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
      console.error('Fetch my-orders error:', err);
      setError(err.message || 'Failed to load orders.');
      toast.error('Failed to load orders');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (firebaseUser) {
      fetchOrders();
    }
  }, [firebaseUser]);

  return (
    <>
      <Head>
        <title>My Orders | Veilnwear</title>
        <meta
          name="description"
          content="View your past orders placed on Veilnwear."
        />
      </Head>

      <section className="mx-auto flex max-w-3xl flex-col gap-6 py-8 px-4">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Account</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-50">
            My Orders
          </h1>
          <p className="text-sm text-neutral-400">
            Review your previous purchases and their statuses.
          </p>
        </header>

        {loading ? (
          <div className="flex min-height-[150px] items-center justify-center">
            <p className="text-sm text-neutral-400">Loading account...</p>
          </div>
        ) : !appUser ? (
          <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-6 text-sm text-neutral-300">
            <p>You&apos;re not logged in.</p>
            <p className="text-xs text-neutral-500">
              Login to see your order history.
            </p>
            <div className="flex gap-3 pt-1">
              <Link
                href="/login"
                className="rounded-full border border-neutral-100 bg-neutral-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-950 hover:bg-white"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-neutral-700 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-200 hover:border-neutral-400"
              >
                Sign Up
              </Link>
            </div>
          </div>
        ) : fetching ? (
          <div className="flex min-h-[150px] items-center justify-center">
            <p className="text-sm text-neutral-400">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 bg-neutral-950/60 px-4 py-8 text-center">
            <p className="mb-2 text-sm text-neutral-400">
              You don&apos;t have any orders yet.
            </p>
            <Link
              href="/shop"
              className="text-xs text-neutral-200 underline underline-offset-2 hover:text-white"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 text-sm text-neutral-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                      Order
                    </p>
                    <p className="font-mono text-xs text-neutral-200">
                      {order.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-400">
                      Placed:{' '}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : '—'}
                    </p>
                    <div className="flex flex-col items-end gap-1 mt-1">
                      <p className="text-xs text-neutral-400">
                        Status: <span className="text-neutral-100">{order.status}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase text-neutral-500 border border-neutral-800 px-1 rounded">
                          {order.paymentMethod}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${order.isPaid
                              ? 'bg-green-950 text-green-400'
                              : 'bg-yellow-950 text-yellow-400'
                            }`}
                        >
                          {order.isPaid ? 'PAID' : 'UNPAID'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-800 pt-2 text-xs text-neutral-300 space-y-1">
                  {order.items.map((item, idx) => (
                    <div
                      key={`${item.productId}-${idx}`}
                      className="flex justify-between gap-2"
                    >
                      <div>
                        <p className="text-neutral-100">{item.name}</p>
                        {item.size && (
                          <p className="text-neutral-500">Size: {item.size}</p>
                        )}
                        <p className="text-neutral-500">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-neutral-800 pt-2 flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Total</span>
                  <span className="font-semibold text-neutral-100">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default MyOrdersPage;
