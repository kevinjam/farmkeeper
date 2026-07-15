'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  Globe,
  Loader2,
  Phone,
  Smartphone,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { BillingMeta, PaidPlanId, Plan, Plans } from '@/lib/billing';

type PaymentMethod = 'mobile_money' | 'ussd' | 'card';
type PaymentStep = 'method' | 'details' | 'processing' | 'pending' | 'success' | 'error';

interface PaymentModalProps {
  open: boolean;
  plan: PaidPlanId;
  plans: Plans;
  billingMeta?: BillingMeta | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({
  open,
  plan,
  plans,
  billingMeta,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const isInternational =
    billingMeta?.region === 'international' || billingMeta?.currency === 'USD';
  const availableMethods: PaymentMethod[] = isInternational
    ? ['card']
    : ((billingMeta?.paymentMethods as PaymentMethod[] | undefined) ?? [
        'mobile_money',
        'ussd',
        'card',
      ]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    isInternational ? 'card' : 'mobile_money'
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('method');
  const [errorMessage, setErrorMessage] = useState('');
  const [ussdCode, setUssdCode] = useState('');
  const paymentReference = useRef<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPoll = () => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  };

  useEffect(() => {
    if (!open) {
      clearPoll();
      setPaymentStep('method');
      setPhoneNumber('');
      setPaymentMethod(isInternational ? 'card' : 'mobile_money');
      setErrorMessage('');
      setUssdCode('');
      paymentReference.current = null;
    }
    return clearPoll;
  }, [open, isInternational]);

  const pollPaymentStatus = (reference: string) => {
    clearPoll();
    let attempts = 0;
    pollTimer.current = setInterval(async () => {
      attempts += 1;
      try {
        const response = await apiClient.getPaymentStatus(reference);
        if (response.success && response.data.status === 'completed') {
          clearPoll();
          setPaymentStep('success');
        } else if (attempts >= 40) {
          clearPoll();
          setErrorMessage('Payment not confirmed yet. Check your phone or try again.');
          setPaymentStep('error');
        }
      } catch {
        if (attempts >= 40) {
          clearPoll();
          setPaymentStep('error');
          setErrorMessage('Could not verify payment. Try again in a moment.');
        }
      }
    }, 3000);
  };

  const handleSubmitWithMethod = async (method: PaymentMethod) => {
    setPaymentMethod(method);
    setErrorMessage('');
    setPaymentStep('processing');
    try {
      const response = await apiClient.initiateSubscription({
        plan,
        paymentMethod: method,
        phoneNumber: phoneNumber || undefined,
      });
      if (!response.success) {
        throw new Error(response.error || response.message || 'Payment failed to start');
      }
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Payment failed');
      setPaymentStep('error');
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    setPaymentStep('processing');

    try {
      const response = await apiClient.initiateSubscription({
        plan,
        paymentMethod,
        phoneNumber: phoneNumber || undefined,
      });

      if (!response.success) {
        throw new Error(response.error || response.message || 'Payment failed to start');
      }

      paymentReference.current = response.data.reference;

      if (response.data.provider === 'stripe' && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
        return;
      }

      if (response.data.paymentUrl) {
        const paymentWindow = window.open(response.data.paymentUrl, '_blank', 'width=480,height=720');
        setPaymentStep('pending');
        const checkClosed = setInterval(() => {
          if (paymentWindow?.closed) {
            clearInterval(checkClosed);
            pollPaymentStatus(response.data.reference);
          }
        }, 1000);
        return;
      }

      if (response.data.ussdCode) {
        setUssdCode(response.data.ussdCode);
        setPaymentStep('pending');
        pollPaymentStatus(response.data.reference);
        return;
      }

      if (paymentMethod === 'mobile_money') {
        setPaymentStep('pending');
        pollPaymentStatus(response.data.reference);
        return;
      }

      setPaymentStep('success');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Payment failed');
      setPaymentStep('error');
    }
  };

  if (!open) return null;

  const selectedPlan: Plan = plans[plan];

  const methodOptions: {
    id: PaymentMethod;
    title: string;
    sub: string;
    icon: typeof Smartphone;
    hidden?: boolean;
  }[] = [
    {
      id: 'mobile_money',
      title: 'Mobile Money',
      sub: 'MTN or Airtel (Uganda)',
      icon: Smartphone,
      hidden: !availableMethods.includes('mobile_money'),
    },
    {
      id: 'ussd',
      title: 'USSD / MoMo',
      sub: 'MTN *165* or Airtel *185*',
      icon: Phone,
      hidden: !availableMethods.includes('ussd'),
    },
    {
      id: 'card',
      title: 'Credit / debit card',
      sub: isInternational ? 'Powered by Stripe' : 'Visa, Mastercard via Stripe',
      icon: isInternational ? Globe : CreditCard,
      hidden: !availableMethods.includes('card'),
    },
  ].filter((m) => !m.hidden);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center md:p-4">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-gray-900 md:rounded-2xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-600 md:hidden" />
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Complete payment</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/80">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{selectedPlan.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPlan.description}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary-600">{selectedPlan.price}</p>
              <p className="text-xs text-gray-500">/{selectedPlan.period}</p>
            </div>
          </div>
        </div>

        {paymentStep === 'method' && (
          <div className="space-y-3">
            {isInternational ? (
              <>
                <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-violet-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Card payment</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        International billing is in USD via Stripe. Mobile money is not available for your country.
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  className="h-12 w-full rounded-xl text-base font-semibold"
                  onClick={() => void handleSubmitWithMethod('card')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay {selectedPlan.price} with card
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment method</p>
                {methodOptions.length === 0 ? (
                  <p className="text-sm text-gray-500">No payment methods available for your region.</p>
                ) : (
                  methodOptions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(item.id);
                        if (item.id === 'card') {
                          void handleSubmitWithMethod(item.id);
                        } else {
                          setPaymentStep('details');
                        }
                      }}
                      className="relative w-full rounded-xl border border-gray-200 p-4 text-left transition hover:border-primary-500 hover:bg-primary-50/50 dark:border-gray-700 dark:hover:bg-primary-950/20"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                          <p className="text-sm text-gray-500">{item.sub}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </>
            )}
          </div>
        )}

        {paymentStep === 'details' && (
          <div className="space-y-4">
            {(paymentMethod === 'mobile_money' || paymentMethod === 'ussd') && (
              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+256 771 234 567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1 min-h-11 rounded-xl"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {paymentMethod === 'ussd'
                    ? 'Enter your MoMo number. Approve the prompt on your phone.'
                    : "You'll receive a prompt on your phone to approve."}
                </p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="min-h-11 flex-1 rounded-xl" onClick={() => setPaymentStep('method')}>
                Back
              </Button>
              <Button
                className="min-h-11 flex-1 rounded-xl"
                disabled={
                  (paymentMethod === 'mobile_money' || paymentMethod === 'ussd') && !phoneNumber.trim()
                }
                onClick={handleSubmit}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary-600" />
            <p className="font-medium text-gray-900 dark:text-white">Starting payment…</p>
          </div>
        )}

        {paymentStep === 'pending' && (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary-600" />
            <p className="font-semibold text-gray-900 dark:text-white">Waiting for payment</p>
            <p className="mt-2 text-sm text-gray-500">
              {paymentMethod === 'mobile_money'
                ? 'Approve the payment on your phone. We&apos;ll confirm automatically.'
                : 'Complete the USSD steps on your phone.'}
            </p>
            {ussdCode && <p className="mt-3 font-mono text-lg font-bold text-primary-600">{ussdCode}</p>}
            <Button variant="outline" className="mt-6 w-full rounded-xl" onClick={onClose}>
              I&apos;ll wait in the background
            </Button>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
            <p className="font-semibold text-gray-900 dark:text-white">
              {plan === 'premium' ? 'You&apos;re on Premium' : 'Farmer plan activated'}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {plan === 'premium'
                ? 'All features are now unlocked on your farm.'
                : 'Finances, eggs, feed & more are ready to use.'}
            </p>
            <Button
              className="mt-6 min-h-11 w-full rounded-xl"
              onClick={() => {
                onSuccess();
                onClose();
              }}
            >
              Done
            </Button>
          </div>
        )}

        {paymentStep === 'error' && (
          <div className="py-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
            <p className="font-semibold text-gray-900 dark:text-white">Payment not completed</p>
            <p className="mt-2 text-sm text-red-600">{errorMessage || 'Something went wrong. Please try again.'}</p>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setPaymentStep('method')}>
                Try again
              </Button>
              <Button className="flex-1 rounded-xl" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
