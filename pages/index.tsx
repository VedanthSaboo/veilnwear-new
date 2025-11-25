// pages/index.tsx
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';

import dbConnect from '@/lib/dbConnect';
import ProductModel, { IProduct } from '@/models/Product';
import ProductCard from '@/components/products/ProductCard';
import HeroSection from '@/components/home/HeroSection';

interface HomeProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
}

interface HomePageProps {
  featuredProducts: HomeProduct[];
}

const HomePage: NextPage<HomePageProps> = ({ featuredProducts }) => {
  return (
    <>
      <Head>
        <title>Veilnwear | Minimal Monochrome E-Commerce</title>
        <meta
          name="description"
          content="Veilnwear — a minimal black & white e-commerce experience for veils, abayas and essentials."
        />
      </Head>

      {/* HERO */}
      <HeroSection />

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <header className="mb-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
              Featured
            </p>
            <h2 className="text-lg font-semibold text-neutral-50 sm:text-xl">
              Featured Pieces
            </h2>
          </div>
        </header>

        {featuredProducts.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No featured products yet. Mark some products as{' '}
            <span className="font-mono text-neutral-300">isFeatured = true</span> in
            the admin panel.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default HomePage;

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  await dbConnect();

  const featuredDocs = await ProductModel.find({ isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean<IProduct[]>();

  const featuredProducts: HomeProduct[] = featuredDocs.map((p) => ({
    id: (p._id as any).toString(),
    name: p.name,
    slug: p.slug,
    price: p.price,
    images: p.images || [],
  }));

  return {
    props: {
      featuredProducts,
    },
    revalidate: 60,
  };
};
