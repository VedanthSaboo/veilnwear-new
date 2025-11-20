// pages/about.tsx
import type { NextPage } from 'next';
import Head from 'next/head';

const AboutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>About Us | Veilnwear</title>
        <meta
          name="description"
          content="Learn about the Veilnwear brand — minimalist streetwear with culture, comfort, and craft."
        />
      </Head>

      <section className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <h1 className="text-3xl font-semibold text-neutral-50">About Veilnwear</h1>
        <p className="text-neutral-300 leading-relaxed">
          Veilnwear is a minimalist streetwear label inspired by contemporary culture,
          monochrome aesthetics, and effortless daily wear. Our mission is to create 
          apparel that blends comfort, durability, and visual identity.
        </p>

        <p className="text-neutral-300 leading-relaxed">
          We believe in premium quality fabrics, mindful production, and designs that
          feel timeless — not seasonal. Every piece is carefully crafted to be worn
          long, lived in, and loved.
        </p>
      </section>
    </>
  );
};

export default AboutPage;
