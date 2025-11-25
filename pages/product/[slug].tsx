// pages/product/[slug].tsx
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';
import dbConnect from '@/lib/dbConnect';
import ProductModel, { IProduct } from '@/models/Product';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';

interface ProductPageProps {
  product: {
    id: string;
    name: string;
    price: number;
    slug: string;
    description: string;
    images: string[];
    sizes: string[];
    stock: number;
  };
}

const formatPrice = (priceInCents: number) => {
  const rupees = priceInCents / 100;
  return `₹${rupees.toFixed(2)}`;
};

const ProductPage: NextPage<ProductPageProps> = ({ product }) => {
  const [activeImage, setActiveImage] = useState(product.images?.[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes?.[0]
  );
  const { addToCart } = useCart();

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      size: selectedSize,
      quantity: 1,
      slug: product.slug,
    });
    toast.success('Added to cart');
  };

  return (
    <>
      <Head>
        <title>{product.name} | Veilnwear</title>
        <meta name="description" content={product.description} />
      </Head>

      <section className="mx-auto max-w-6xl px-4 py-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-neutral-900">
              {activeImage && (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="rounded-full border border-white/20 bg-black/50 px-6 py-3 text-lg font-bold uppercase tracking-widest text-white backdrop-blur-md">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail row (if multiple images) */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(img)}
                    className={`relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-md border transition ${activeImage === img
                      ? 'border-neutral-50'
                      : 'border-neutral-700 hover:border-neutral-400'
                      }`}
                  >
                    <Image
                      src={img}
                      alt="Thumbnail"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 text-neutral-200">
            <header className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                Veilnwear
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-50">
                {product.name}
              </h1>
              <p className="text-lg font-medium">{formatPrice(product.price)}</p>
            </header>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Description
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Sizes
                </h2>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={isOutOfStock}
                      className={`rounded-md border px-3 py-1 text-xs transition ${selectedSize === size
                        ? 'border-neutral-50 bg-neutral-50 text-neutral-950'
                        : 'border-neutral-700 text-neutral-300 hover:border-neutral-400'
                        } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full rounded-full border px-8 py-3 text-sm font-medium uppercase tracking-[0.18em] sm:w-auto ${isOutOfStock
                    ? 'border-neutral-800 bg-neutral-900 text-neutral-500 cursor-not-allowed'
                    : 'border-neutral-100 bg-neutral-50 text-neutral-950 hover:bg-white'
                  }`}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              {product.stock > 0 && product.stock < 5 && (
                <p className="mt-2 text-xs text-orange-400">
                  Only {product.stock} left in stock!
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductPage;

//
// Static Paths / Props
//

export const getStaticPaths: GetStaticPaths = async () => {
  await dbConnect();
  const products = await ProductModel.find({}, 'slug').lean();
  return {
    paths: products.map((p) => ({
      params: { slug: p.slug },
    })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const slug = ctx.params?.slug;
  if (!slug || typeof slug !== 'string') {
    return { notFound: true };
  }

  await dbConnect();
  const product = await ProductModel.findOne({ slug }).lean<IProduct | null>();

  if (!product) {
    return { notFound: true };
  }

  return {
    props: {
      product: {
        id: (product._id as any).toString(),
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        images: product.images || [],
        sizes: product.sizes || [],
        stock: product.stock ?? 0,
      },
    },
    revalidate: 60,
  };
};
