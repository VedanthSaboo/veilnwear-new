// pages/login/index.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage: NextPage = () => {
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      toast.success('Logged in successfully');

      // Handle redirect param if present (e.g., /login?redirect=/checkout)
      const redirect = typeof router.query.redirect === 'string'
        ? router.query.redirect
        : null;

      if (redirect) {
        router.push(redirect);
      } else {
        router.push('/'); // go to home page by default
      }
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err?.message || 'Failed to log in. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Login | Veilnwear</title>
        <meta
          name="description"
          content="Login to your Veilnwear account to view orders and manage your profile."
        />
      </Head>

      <section className="mx-auto flex max-w-md flex-col gap-6 py-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Account</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-50">
            Login
          </h1>
          <p className="text-sm text-neutral-400">
            Enter your credentials to access your account.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email', { required: true })}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password', { required: true })}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="w-full rounded-full border border-neutral-100 bg-neutral-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-950 hover:bg-white disabled:cursor-not-allowed disabled:border-neutral-700 disabled:bg-neutral-800 disabled:text-neutral-400"
            >
              Login
            </Button>
          </div>
        </form>

        <p className="text-xs text-neutral-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-neutral-100 underline underline-offset-2">
            Sign up
          </Link>
        </p>
      </section>
    </>
  );
};

export default LoginPage;
