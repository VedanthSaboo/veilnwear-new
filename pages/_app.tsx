// pages/_app.tsx
import type { AppProps } from 'next/app';
import '@/styles/globals.css';

import Layout from '@/layouts/Layout';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
            }}
          />

          <Component {...pageProps} />
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}
