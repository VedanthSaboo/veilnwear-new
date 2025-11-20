// pages/contact.tsx
import type { NextPage } from 'next';
import Head from 'next/head';

const ContactPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Contact Us | Veilnwear</title>
        <meta
          name="description"
          content="Get in touch with Veilnwear customer support or business enquiries."
        />
      </Head>

      <section className="max-w-xl mx-auto px-6 py-12 space-y-6">
        <h1 className="text-3xl font-semibold text-neutral-50">Contact</h1>

        <p className="text-neutral-300">
          For support or order questions, please reach us at:
        </p>

        <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-5 space-y-1 text-neutral-200 text-sm">
          <p>Email: support@veilnwear.com</p>
          <p>Instagram: @veilnwear</p>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
