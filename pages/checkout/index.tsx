// pages/checkout/index.tsx
import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

interface CheckoutFormValues {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  paymentMethod: 'cod' | 'card';
}

const formatPrice = (priceInCents: number): string => {
  const rupees = priceInCents / 100;
  return `₹${rupees.toFixed(2)}`;
};

// Mock Payment Modal Component
const PaymentModal = ({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalAmount: number;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-950 p-6">
        <h3 className="text-lg font-semibold text-neutral-50 mb-4">Enter Card Details</h3>
        <p className="text-sm text-neutral-400 mb-6">
          Total Amount: <span className="text-neutral-50 font-medium">{formatPrice(totalAmount)}</span>
        </p>

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Cardholder Name</label>
            <input
              required
              type="text"
              placeholder="John Doe"
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Card Number</label>
            <input
              required
              type="text"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Expiry Date</label>
              <input
                required
                type="text"
                placeholder="MM/YY"
                maxLength={5}
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">CVV</label>
              <input
                required
                type="text"
                placeholder="123"
                maxLength={3}
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 rounded-md border border-neutral-700 bg-transparent py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 rounded-md bg-white py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CheckoutPage: NextPage = () => {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  const { appUser, firebaseUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<CheckoutFormValues | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    defaultValues: {
      country: 'India',
      paymentMethod: 'cod',
    },
  });

  // Redirect if cart is empty
  React.useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart');
    }
  }, [items, router]);

  const handlePlaceOrder = async (values: CheckoutFormValues, isPaid: boolean = false) => {
    try {
      setIsSubmitting(true);
      const token = await firebaseUser?.getIdToken();

      const payload = {
        items: items.map((item) => ({
          product: item.productId, // Map productId to product for Mongoose
          name: item.name,
          slug: item.slug,
          image: item.image,
          quantity: item.quantity,
          size: item.size,
          price: item.price, // Snapshot price at time of order
        })),
        shippingAddress: {
          fullName: values.fullName,
          addressLine1: values.addressLine1,
          addressLine2: values.addressLine2,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: values.country,
        },
        paymentMethod: values.paymentMethod,
        isPaid: isPaid,
        totalPrice: cartTotal,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to place order');
      }

      const orderData = await res.json();

      // Clear cart and redirect to success page
      clearCart();
      toast.success('Order placed successfully!');

      // API returns { order: { id: ... } }
      const orderId = orderData.order?.id || orderData.id;
      router.push(`/order-success/${orderId}`);

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowPaymentModal(false);
    }
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!appUser || !firebaseUser) {
      toast.error('Please login to place an order');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (values.paymentMethod === 'card') {
      setPendingFormData(values);
      setShowPaymentModal(true);
    } else {
      await handlePlaceOrder(values, false);
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      <Head>
        <title>Checkout | Veilnwear</title>
      </Head>

      <section className="max-w-4xl mx-auto py-8 space-y-8">
        <header>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-50">Checkout</h1>
          <p className="text-sm text-neutral-400">Complete your purchase</p>
        </header>

        <div className="grid gap-8 md:grid-cols-[1fr,320px]">
          {/* Form */}
          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/50 p-6">
              <h2 className="text-lg font-medium text-neutral-200">Shipping Address</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Full Name</label>
                  <input
                    {...register('fullName', { required: 'Full name is required' })}
                    className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
                  />
                  {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Address Line 1</label>
                  <input
                    {...register('addressLine1', { required: 'Address is required' })}
                    className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
                  />
                  {errors.addressLine1 && <p className="text-xs text-red-400 mt-1">{errors.addressLine1.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Address Line 2 (Optional)</label>
                  <input
                    {...register('addressLine2')}
                    className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">City</label>
                    <input
                      {...register('city', { required: 'City is required' })}
                      className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
                    />
                    {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">State</label>
                    <input
                      {...register('state', { required: 'State is required' })}
                      className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
                    />
                    {errors.state && <p className="text-xs text-red-400 mt-1">{errors.state.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Postal Code</label>
                    <input
                      {...register('postalCode', { required: 'Postal code is required' })}
                      className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
                    />
                    {errors.postalCode && <p className="text-xs text-red-400 mt-1">{errors.postalCode.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Country</label>
                    <input
                      {...register('country', { required: 'Country is required' })}
                      className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
                    />
                    {errors.country && <p className="text-xs text-red-400 mt-1">{errors.country.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/50 p-6">
              <h2 className="text-lg font-medium text-neutral-200">Payment Method</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-md border border-neutral-800 hover:bg-neutral-900 cursor-pointer">
                  <input
                    type="radio"
                    value="cod"
                    {...register('paymentMethod')}
                    className="text-neutral-50 focus:ring-neutral-500"
                  />
                  <span className="text-sm text-neutral-200">Cash on Delivery</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-md border border-neutral-800 hover:bg-neutral-900 cursor-pointer">
                  <input
                    type="radio"
                    value="card"
                    {...register('paymentMethod')}
                    className="text-neutral-50 focus:ring-neutral-500"
                  />
                  <span className="text-sm text-neutral-200">Credit/Debit Card</span>
                </label>
              </div>
            </div>
          </form>

          {/* Order Summary */}
          <aside className="space-y-6">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-6 sticky top-24">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-200 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm mb-6">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex justify-between text-neutral-400">
                    <span>{item.name} x {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-neutral-800 pt-3 flex justify-between font-semibold text-neutral-100">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="w-full rounded-full border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-medium uppercase tracking-[0.18em] text-neutral-950 hover:bg-white disabled:cursor-not-allowed"
              >
                Place Order
              </Button>
            </div>
          </aside>
        </div>
      </section>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={() => pendingFormData && handlePlaceOrder(pendingFormData, true)}
        totalAmount={cartTotal}
      />
    </>
  );
};

export default CheckoutPage;