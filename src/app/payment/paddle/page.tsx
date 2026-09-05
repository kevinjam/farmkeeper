'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

declare global {
  interface Window {
    Paddle?: {
      Environment: { set: (env: string) => void };
      Initialize: (opts: {
        token: string;
        eventCallback?: (event: { name?: string; data?: { id?: string } }) => void;
      }) => void;
      Checkout: {
        open: (opts: {
          transactionId: string;
          settings?: {
            successUrl?: string;
            displayMode?: string;
            theme?: string;
          };
        }) => void;
      };
    };
  }
}

function PaddleCheckoutContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('_ptxn');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<{ token: string; env: string } | null>(null);

  useEffect(() => {
    apiClient
      .getPaymentConfig()
      .then((res) => {
        const token = res.data?.paddleClientToken;
        const env = res.data?.paddleEnvironment === 'production' ? 'production' : 'sandbox';
        if (!token) {
          setError('Card checkout is not available right now.');
          return;
        }
        setConfig({ token, env });
      })
      .catch(() => setError('Could not load payment configuration.'));
  }, []);

  useEffect(() => {
    if (!ready || !config || !transactionId || !window.Paddle) return;

    try {
      window.Paddle.Environment.set(config.env);
      window.Paddle.Initialize({
        token: config.token,
        eventCallback: (event) => {
          if (event.name === 'checkout.completed') {
            const txn = event.data?.id || transactionId;
            window.location.href = `/payment/callback?provider=paddle&transaction_id=${encodeURIComponent(txn)}`;
          }
          if (event.name === 'checkout.closed') {
            window.location.href = '/payment/callback?provider=paddle&status=cancelled';
          }
        },
      });
      window.Paddle.Checkout.open({
        transactionId,
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          successUrl: `${window.location.origin}/payment/callback?provider=paddle&transaction_id=${encodeURIComponent(transactionId)}`,
        },
      });
    } catch (err) {
      setError(err instanceof Error && !/paddle/i.test(err.message) ? err.message : 'Could not open checkout. Return to billing and try again.');
    }
  }, [ready, config, transactionId]);

  if (!transactionId) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-gray-600">Missing checkout session. Return to billing and try again.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4">
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      <p className="text-sm text-gray-600">Opening secure checkout…</p>
    </div>
  );
}

export default function PaddlePaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <PaddleCheckoutContent />
    </Suspense>
  );
}
