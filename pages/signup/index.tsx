// pages/signup/index.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

interface SignupFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

const SignupPage: NextPage = () => {
  const router = useRouter();
  const { signup } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = useForm<SignupFormValues>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    const { email, password, confirmPassword } = values;

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await signup(email, password);
      toast.success('Account created! Please log in.');
      router.push('/login');
    } catch (err: any) {
      console.error('Signup error:', err);
      toast.error(err?.message || 'Failed to sign up. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up | Veilnwear</title>
        <meta
          name="description"
          content="Create your Veilnwear account to place orders and manage your profile."
        />
      </Head>

      <section className="mx-auto flex max-w-md flex-col gap-6 py-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Account</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-50">
            Create an Account
          </h1>
          <p className="text-sm text-neutral-400">
            Sign up with your email and password to get started.
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
              autoComplete="new-password"
              {...register('password', { required: true, minLength: 6 })}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-300"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword', { required: true, minLength: 6 })}
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
              Sign Up
            </Button>
          </div>
        </form>

        <p className="text-xs text-neutral-400">
          Already have an account?{' '}
          <Link href="/login" className="text-neutral-100 underline underline-offset-2">
            Login
          </Link>
        </p>
      </section>
    </>
  );
};

export default SignupPage;
