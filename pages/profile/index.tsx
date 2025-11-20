// pages/profile/index.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

const ProfilePage: NextPage = () => {
  const { firebaseUser, appUser, loading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // No redirect yet; user will just see logged-out state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Profile | Veilnwear</title>
        <meta
          name="description"
          content="View your Veilnwear profile information and manage your account."
        />
      </Head>

      <section className="mx-auto flex max-w-md flex-col gap-6 py-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Account</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-50">
            Profile
          </h1>
          <p className="text-sm text-neutral-400">
            View your account details and manage your session.
          </p>
        </header>

        {loading ? (
          <div className="flex min-h-[100px] items-center justify-center">
            <p className="text-sm text-neutral-400">Loading your profile...</p>
          </div>
        ) : !firebaseUser || !appUser ? (
          <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-6 text-sm text-neutral-300">
            <p>You&apos;re not logged in.</p>
            <p className="text-xs text-neutral-500">
              Login or create an account to view your profile and orders.
            </p>
            <div className="flex gap-3 pt-1">
              <Link
                href="/login"
                className="rounded-full border border-neutral-100 bg-neutral-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-950 hover:bg-white"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-neutral-700 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-200 hover:border-neutral-400"
              >
                Sign Up
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-6 text-sm text-neutral-200">
            {/* Basic appUser info */}
            <div className="space-y-1">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300">
                Account
              </h2>
              <p>Email: {appUser.email || firebaseUser.email}</p>
              <p className="text-xs text-neutral-400">
                Role: {appUser.role}
              </p>
              <p className="text-xs text-neutral-500">
                Firebase UID: {appUser.firebaseUid}
              </p>
            </div>

            {/* Orders section with My Orders link */}
            <div className="space-y-2 pt-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300">
                Orders
              </h2>
              <p className="text-xs text-neutral-500">
                View your past orders and their status.
              </p>
              <Link
                href="/my-orders"
                className="inline-flex items-center justify-center rounded-full border border-neutral-700 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-200 hover:border-neutral-400"
              >
                View My Orders
              </Link>
            </div>

            <div className="pt-4">
              <Button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-200 hover:border-neutral-400 hover:bg-neutral-800"
              >
                Logout
              </Button>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default ProfilePage;
