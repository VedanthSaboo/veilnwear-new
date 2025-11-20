// pages/order-success/[orderId].tsx
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

interface OrderSuccessPageProps {
  orderId: string | null;
}

const OrderSuccessPage: NextPage<OrderSuccessPageProps> = ({ orderId }) => {
  return (
    <>
      <Head>
        <title>Order Success | Veilnwear</title>
        <meta
          name="description"
          content="Thank you for your order with Veilnwear."
        />
      </Head>

      <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Order Placed
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-neutral-50">
          Thank you for your order.
        </h1>
        <p className="max-w-md text-sm text-neutral-400">
          We&apos;re processing your order and will send you an email with tracking details
          once it ships.
        </p>

        {orderId && (
          <p className="text-xs text-neutral-500">
            Your order ID is{' '}
            <span className="font-mono text-neutral-200">{orderId}</span>.
          </p>
        )}

        <div className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link
            href="/shop"
            className="rounded-full border border-neutral-100 bg-neutral-50 px-5 py-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-950 hover:bg-white"
          >
            Continue Shopping
          </Link>
          <Link
            href="/my-orders"
            className="rounded-full border border-neutral-700 px-5 py-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-200 hover:border-neutral-400"
          >
            View My Orders
          </Link>
        </div>
      </section>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<OrderSuccessPageProps> = async (
  context,
) => {
  const orderId = typeof context.params?.orderId === 'string'
    ? context.params.orderId
    : null;

  // Later you can fetch + verify ownership here.
  return {
    props: {
      orderId,
    },
  };
};

export default OrderSuccessPage;
