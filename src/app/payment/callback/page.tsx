'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

const REDIRECT_SECONDS = 4;

function resolveContinueHref(): string {
  if (typeof window === 'undefined') return '/en/auth/login';
  const farmSlug = localStorage.getItem('farmSlug');
  if (farmSlug) {
    return `/en/${farmSlug}/dashboard/subscription`;
  }
  return '/en/auth/login';
}

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const [continueHref, setContinueHref] = useState('/en/auth/login');

  useEffect(() => {
    setContinueHref(resolveContinueHref());

    const provider = searchParams.get('provider');
    const transactionId = searchParams.get('transaction_id') || searchParams.get('_ptxn');
    const txStatus = searchParams.get('status');

    if (txStatus === 'cancelled' || txStatus === 'failed') {
      setStatus('failed');
      return;
    }

    if (provider === 'paddle' && transactionId) {
      apiClient
        .verifyPaddleTransaction(transactionId)
        .then((res) => {
          if (res.success) {
            setStatus('success');
            localStorage.setItem('refreshSubscription', 'true');
          } else {
            setStatus('failed');
          }
        })
        .catch(() => setStatus('failed'));
      return;
    }

    if (txStatus === 'successful' || txStatus === 'completed') {
      setStatus('success');
      localStorage.setItem('refreshSubscription', 'true');
    } else {
      setStatus('success');
      localStorage.setItem('refreshSubscription', 'true');
    }
  }, [searchParams]);

  // Auto-redirect after success or failure
  useEffect(() => {
    if (status === 'loading') return;

    let cancelled = false;
    let countdown: ReturnType<typeof setInterval> | undefined;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    setSecondsLeft(REDIRECT_SECONDS);

    (async () => {
      let href = resolveContinueHref();
      if (href === '/en/auth/login') {
        try {
          const res = await apiClient.getAuthStatus();
          const slug = res.data?.farm?.slug;
          if (slug) {
            localStorage.setItem('farmSlug', slug);
            href = `/en/${slug}/dashboard/subscription`;
          }
        } catch {
          /* keep login fallback */
        }
      }
      if (cancelled) return;

      setContinueHref(href);

      countdown = setInterval(() => {
        setSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);

      redirectTimer = setTimeout(() => {
        router.replace(href);
      }, REDIRECT_SECONDS * 1000);
    })();

    return () => {
      cancelled = true;
      if (countdown) clearInterval(countdown);
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
            <p className="mt-4 font-medium text-gray-900 dark:text-white">Confirming payment…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-600" />
            <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Payment received</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Redirecting in {secondsLeft}s…
            </p>
            <Link
              href={continueHref}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary-600 px-4 font-semibold text-white"
            >
              Continue
            </Link>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-600" />
            <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Payment not completed</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              You can try again from Plan &amp; billing. Redirecting in {secondsLeft}s…
            </p>
            <Link
              href={continueHref}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary-600 px-4 font-semibold text-white"
            >
              Continue
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
