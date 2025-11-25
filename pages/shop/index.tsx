// pages/shop.tsx
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import dbConnect from '@/lib/dbConnect';
import ProductModel, { IProduct } from '@/models/Product';
import ProductCard from '@/components/products/ProductCard';
import React from 'react';

type ShopProduct = {
  id: string;
  name?: string | null;
  slug?: string | null;
  price?: number | null;
  images: string[];
  isFeatured: boolean;
};

interface ShopPageProps {
  products: ShopProduct[];
}

const ShopPage: NextPage<ShopPageProps> = ({ products }) => {
  return (
    <>
      <Head>
        <title>Shop | Veilnwear</title>
        <meta name="description" content="Browse products at Veilnwear" />
      </Head>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-50">Shop</h1>
          <p className="text-sm text-neutral-400">Browse our collection.</p>
        </header>

        <section>
          {products && products.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">No products available.</p>
          )}
        </section>
      </main>
    </>
  );
};

export default ShopPage;

export const getStaticProps: GetStaticProps<ShopPageProps> = async () => {
  await dbConnect();

  // fetch all products (no hidden filters)
  const docs = await ProductModel.find({}).lean<IProduct[]>();

  // Map to consistent shape for front-end
  const products = (docs || []).map((p) => ({
    id: (p._id as any).toString(),
    name: p.name ?? null,
    slug: p.slug ?? null,
    price: typeof p.price === 'number' ? p.price : null,
    images: Array.isArray(p.images) ? p.images : [],
    isFeatured: !!p.isFeatured,
  }));

  return {
    props: {
      products,
    },
    revalidate: 60,
  };
};
