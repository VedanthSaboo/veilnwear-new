// pages/cart/index.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';

const formatPrice = (priceInCents: number): string => {
  const rupees = priceInCents / 100;
  return `₹${rupees.toFixed(2)}`;
};

const CartPage: NextPage = () => {
  const { items, cartTotal, cartCount, removeFromCart, updateItemQuantity, clearCart } =
    useCart();

  const hasItems = items.length > 0;

  const handleQuantityChange = (productId: string, size: string | undefined, value: string) => {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return;
    }
    updateItemQuantity(productId, size, parsed);
  };

  return (
    <>
      <Head>
        <title>Cart | Veilnwear</title>
        <meta
          name="description"
          content="Review the items in your Veilnwear cart before completing your purchase."
        />
      </Head>

      <section className="space-y-6 sm:space-y-8">
        {/* Header */}
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Cart</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-neutral-50">
            Your Bag
          </h1>
          <p className="text-sm text-neutral-400">
            {cartCount > 0
              ? `You have ${cartCount} item${cartCount !== 1 ? 's' : ''} in your bag.`
              : 'Your cart is currently empty.'}
          </p>
        </header>

        {/* Content */}
        {hasItems ? (
          <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
            {/* Items list */}
            <div className="space-y-4">
              {items.map((item) => (
                <article
                  key={`${item.productId}-${item.size ?? 'nosize'}`}
                  className="flex gap-4 rounded-xl border border-neutral-800 bg-neutral-950/70 p-3 sm:p-4"
                >
                  {/* Thumbnail */}
                  <div className="h-28 w-20 flex-shrink-0 overflow-hidden rounded-md bg-neutral-800">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between gap-2">
                    <div className="space-y-1">
                      <Link
                        href={`/product/${item.slug}`}
                        className="line-clamp-2 text-sm sm:text-base font-medium text-neutral-100 hover:underline"
                      >
                        {item.name}
                      </Link>

                      {item.size && (
                        <p className="text-xs text-neutral-400">Size: {item.size}</p>
                      )}

                      <p className="text-xs text-neutral-500">
                        Price: {formatPrice(item.price)} each
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-neutral-400">
                          Qty
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.productId,
                                item.size,
                                e.target.value,
                              )
                            }
                            className="ml-2 w-16 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                          />
                        </label>

                        <button
                          type="button"
                          className="text-xs text-red-400 hover:text-red-300"
                          onClick={() => removeFromCart(item.productId, item.size)}
                        >
                          Remove
                        </button>
                      </div>

                      <p className="text-sm font-semibold text-neutral-100">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}

              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-300"
              >
                Clear cart
              </button>
            </div>

            {/* Summary */}
            <aside className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 sm:p-5 h-fit">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-200">
                Summary
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="font-semibold text-neutral-100">
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                <p className="text-xs text-neutral-500">
                  Taxes and shipping will be calculated at checkout.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                {/* Still no real checkout — just a disabled placeholder */}
                <Link
                  href="/checkout"
                  className={`flex w-full items-center justify-center rounded-full border border-neutral-100 bg-neutral-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-950 hover:bg-white ${!hasItems ? 'pointer-events-none opacity-50' : ''
                    }`}
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/shop"
                  className="block text-center text-xs text-neutral-400 hover:text-neutral-200 underline underline-offset-2"
                >
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 bg-neutral-950/60 px-4 py-8 text-center">
            <p className="mb-2 text-sm text-neutral-400">
              Your cart is empty.
            </p>
            <Link
              href="/shop"
              className="text-xs text-neutral-200 underline underline-offset-2 hover:text-white"
            >
              Browse the collection
            </Link>
          </div>
        )}
      </section>
    </>
  );
};

export default CartPage;
