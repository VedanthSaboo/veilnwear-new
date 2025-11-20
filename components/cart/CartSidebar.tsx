// components/cart/CartSidebar.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';

export interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { items, cartTotal, cartCount, removeFromCart, updateItemQuantity, clearCart } =
    useCart();

  if (!isOpen) return null;

  const formatPrice = (priceInCents: number): string => {
    const rupees = priceInCents / 100;
    return `₹${rupees.toFixed(2)}`;
  };

  const handleQuantityChange = (productId: string, size: string | undefined, value: string) => {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return;
    }
    updateItemQuantity(productId, size, parsed);
  };

  const hasItems = items.length > 0;

  const handleViewCart = () => {
    if (!hasItems) return;
    onClose();
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
      {/* Panel */}
      <aside className="flex h-full w-full max-w-sm flex-col border-l border-neutral-800 bg-neutral-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-200">
              Cart
            </h2>
            <p className="text-xs text-neutral-500">
              {cartCount} item{cartCount !== 1 ? 's' : ''} in your bag
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-neutral-400 hover:text-neutral-200"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {hasItems ? (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size ?? 'nosize'}`}
                  className="flex gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3"
                >
                  {/* Thumbnail */}
                  <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-neutral-800">
                    {/* Using plain img to keep it simple; we can switch to next/image later if you want */}
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
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="line-clamp-2 text-sm font-medium text-neutral-100">
                        {item.name}
                      </p>
                      {item.size && (
                        <p className="text-xs text-neutral-400">Size: {item.size}</p>
                      )}
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item.productId, item.size, e.target.value)
                          }
                          className="w-14 rounded-md border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                        />
                        <button
                          type="button"
                          className="text-[11px] text-red-400 hover:text-red-300"
                          onClick={() => removeFromCart(item.productId, item.size)}
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-sm font-medium text-neutral-100">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-neutral-500">
                Your cart is empty.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-neutral-400">Subtotal</span>
            <span className="text-base font-semibold text-neutral-100">
              {formatPrice(cartTotal)}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              disabled={!hasItems}
              onClick={handleViewCart}
              className="w-full rounded-full border border-neutral-100 bg-neutral-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-950 hover:bg-white disabled:cursor-not-allowed disabled:border-neutral-700 disabled:bg-neutral-800 disabled:text-neutral-400"
            >
              View Cart
            </Button>

            {hasItems && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] text-neutral-500 underline underline-offset-2 hover:text-neutral-300"
              >
                Clear cart
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CartSidebar;