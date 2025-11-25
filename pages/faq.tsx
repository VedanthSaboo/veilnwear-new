// pages/faq.tsx
import type { NextPage } from 'next';
import Head from 'next/head';

const FAQPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>FAQ | Veilnwear</title>
        <meta
          name="description"
          content="Frequently Asked Questions about Veilnwear orders, shipping, and sizing."
        />
      </Head>

      <section className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <h1 className="text-3xl font-semibold text-neutral-50">FAQ</h1>

        <div className="space-y-6 text-neutral-300 text-sm leading-relaxed">
          <div>
            <h2 className="font-medium text-neutral-100">Do you ship internationally?</h2>
            <p>Yes, we ship to most countries worldwide.</p>
          </div>

          <div>
            <h2 className="font-medium text-neutral-100">How do I know which size to pick?</h2>
            <p>Check our size chart (coming soon). Oversized fits are intentionally relaxed.</p>
          </div>

          <div>
            <h2 className="font-medium text-neutral-100">Can I return or exchange an item?</h2>
            <p>Exchanges/returns are accepted for unused items within 7 days of delivery.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQPage;
