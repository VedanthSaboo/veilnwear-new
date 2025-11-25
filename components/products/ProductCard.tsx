// components/products/ProductCard.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product?: {
    id?: string;
    name?: string;
    slug?: string;
    price?: number; // in cents
    images?: string[] | null;
  } | null;
}

const FALLBACK_IMAGE = 'https://res.cloudinary.com/demo/image/upload/v1640000000/placeholder.png'; // replace with your Cloudinary default if you want

const formatPrice = (priceInCents?: number): string => {
  if (!priceInCents || Number.isNaN(Number(priceInCents))) return '₹0.00';
  const rupees = Number(priceInCents) / 100;
  return `₹${rupees.toFixed(2)}`;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  if (!product) {
    // Avoid render crash — show nothing but log to console so you can trace the issue
    if (typeof window !== 'undefined') {
      // only log in browser
      // eslint-disable-next-line no-console
      console.warn('ProductCard: missing product prop (rendering skipped)');
    }
    return null;
  }

  const imagesArray = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const mainImage = imagesArray.length > 0 ? imagesArray[0] : null;

  const slug = product.slug ?? '';
  const href = slug ? `/product/${slug}` : '#';

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950"
      aria-disabled={!slug}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name ?? 'Product image'}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-xs text-neutral-500">
            {/* fallback visual, you may replace with <Image src={FALLBACK_IMAGE} .../> */}
            No image
          </div>
        )}
      </div>

      <div className="space-y-1 px-3 py-3">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Veilnwear</p>
        <p className="line-clamp-2 text-sm font-medium text-neutral-50">
          {product.name ?? 'Untitled product'}
        </p>
        <p className="text-sm text-neutral-200">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
