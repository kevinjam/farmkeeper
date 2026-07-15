'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Building,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SUPPORTED_COUNTRIES, getCountryByCode, normalizeCountryCode } from '@/lib/countries';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

interface OnboardingData {
  farmName: string;
  name: string;
  plan: string;
  countryCode: string;
}

interface GoogleOnboardingProps {
  userEmail: string;
  userName: string;
  userImage?: string;
}

const STEPS = [
  {
    id: 1,
    title: 'Complete your profile',
    description: 'We need a few details to set up your farm',
    icon: Sprout,
    color: 'text-green-600',
  },
  {
    id: 2,
    title: 'Farm & your name',
    description: 'Tell us your farm name and display name',
    icon: Building,
    color: 'text-blue-600',
  },
  {
    id: 3,
    title: 'Subscription plan',
    description: 'Choose the plan that fits your needs',
    icon: CreditCard,
    color: 'text-purple-600',
  },
];

const SIGNUP_COUNTRY_KEY = 'signup-country';
const SIGNUP_PLAN_KEY = 'signup-plan';

const PRICES = {
  UG: { farmerMonthly: 'UGX 4,000', premium: 'UGX 26,000', free: 'UGX 0', farmerTrial: 'UGX 0' },
  INT: { farmerMonthly: '$5', premium: '$20', free: '$0', farmerTrial: '$0' },
} as const;

function getOnboardingPlans(countryCode: string) {
  const isUganda = getCountryByCode(countryCode).paymentRegion === 'uganda';
  const prices = isUganda ? PRICES.UG : PRICES.INT;
  const payNote = isUganda
    ? 'Pay with MTN, Airtel Money, or card.'
    : 'Pay securely with card via Stripe (USD).';

  return [
    {
      id: 'farmer',
      name: 'Farmer',
      price: prices.farmerTrial,
      pricePeriod: ' for 30 days',
      description: `Full smallholder tools — finances, eggs, feed & more. Then ${prices.farmerMonthly}/mo. ${payNote}`,
      buttonLabel: 'Start free trial',
      featuresHeading: 'INCLUDES:',
      features: ['Up to 50 livestock', 'Finances & receipts', 'Eggs & sales', 'Feed management', 'Weather'],
      mostPopular: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: prices.premium,
      pricePeriod: '/month',
      description: `Unlimited livestock and advanced analytics. ${payNote}`,
      buttonLabel: 'Choose Premium',
      featuresHeading: 'EVERYTHING IN FARMER, PLUS:',
      features: ['Unlimited livestock', 'Advanced analytics', 'Priority support', 'Full billing history'],
      mostPopular: false,
    },
    {
      id: 'free',
      name: 'Free',
      price: prices.free,
      pricePeriod: ' forever',
      description: 'Basic records for very small farms getting started.',
      buttonLabel: 'Choose Free',
      featuresHeading: 'INCLUDES:',
      features: ['Up to 5 livestock', 'Crops & weather', 'Farm settings'],
      mostPopular: false,
    },
  ];
}

function resolveInitialPlan(planParam: string | null): string {
  if (planParam === 'free' || planParam === 'premium' || planParam === 'farmer') return planParam;
  if (planParam === 'trial') return 'farmer';
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(SIGNUP_PLAN_KEY);
    if (stored === 'free' || stored === 'premium' || stored === 'farmer') return stored;
  }
  return 'farmer';
}

function resolveInitialCountry(countryParam: string | null): string {
  if (countryParam) return normalizeCountryCode(countryParam);
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(SIGNUP_COUNTRY_KEY);
    if (stored) return normalizeCountryCode(stored);
  }
  return 'UG';
}

export function GoogleOnboarding({ userEmail, userName, userImage }: GoogleOnboardingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = resolveInitialPlan(searchParams.get('plan'));
  const initialCountry = resolveInitialCountry(searchParams.get('country'));

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    farmName: '',
    name: userName || '',
    plan: initialPlan,
    countryCode: initialCountry,
  });
  const farmNameInputRef = useRef<HTMLInputElement>(null);
  const plans = getOnboardingPlans(onboardingData.countryCode);

  const syncUrlParams = (next: { plan?: string; country?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.plan) params.set('plan', next.plan);
    if (next.country) params.set('country', next.country);
    router.replace(`/en/auth/onboarding?${params.toString()}`, { scroll: false });
  };

  const setCountryCode = (countryCode: string) => {
    const code = normalizeCountryCode(countryCode);
    setOnboardingData((prev) => ({ ...prev, countryCode: code }));
    try {
      localStorage.setItem(SIGNUP_COUNTRY_KEY, code);
    } catch {
      /* ignore */
    }
    syncUrlParams({ country: code, plan: onboardingData.plan });
  };

  const setPlanId = (plan: string) => {
    setOnboardingData((prev) => ({ ...prev, plan }));
    try {
      localStorage.setItem(SIGNUP_PLAN_KEY, plan);
    } catch {
      /* ignore */
    }
    syncUrlParams({ plan, country: onboardingData.countryCode });
  };

  useEffect(() => {
    // Keep URL in sync on first paint when country came from localStorage
    const urlCountry = searchParams.get('country');
    if (!urlCountry || normalizeCountryCode(urlCountry) !== onboardingData.countryCode) {
      syncUrlParams({ country: onboardingData.countryCode, plan: onboardingData.plan });
    }
    try {
      localStorage.setItem(SIGNUP_COUNTRY_KEY, onboardingData.countryCode);
      localStorage.setItem(SIGNUP_PLAN_KEY, onboardingData.plan);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  useEffect(() => {
    if (userName) {
      setOnboardingData((prev) => (prev.name ? prev : { ...prev, name: userName }));
    }
  }, [userName]);

  useEffect(() => {
    if (currentStep !== 2) return;
    const mq = window.matchMedia('(max-width: 767px)');
    if (!mq.matches) return;
    const id = window.setTimeout(() => farmNameInputRef.current?.focus(), 280);
    return () => window.clearTimeout(id);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return onboardingData.farmName.trim().length > 0 && onboardingData.name.trim().length > 0;
      case 3:
        return onboardingData.plan.length > 0;
      default:
        return false;
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${BACKEND_URL}/api/auth/complete-signup`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: userEmail,
          name: onboardingData.name.trim(),
          image: userImage,
          farmName: onboardingData.farmName.trim(),
          plan: onboardingData.plan,
          location: { country: getCountryByCode(onboardingData.countryCode).name },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete registration');
      }

      if (data.token) {
        localStorage.setItem('auth-token', data.token);
      }

      setSuccess(true);

      const farmSlug = data.farm?.slug;
      const redirectUrl = farmSlug ? `/en/${farmSlug}/dashboard` : '/en/auth/login';
      setTimeout(() => router.push(redirectUrl), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[100dvh] md:min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20 px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="text-center space-y-5 max-w-md mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.08, type: 'spring', stiffness: 400, damping: 18 }}
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto drop-shadow-sm" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile complete</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm max-md:text-base leading-relaxed">
            Your farm &quot;{onboardingData.farmName}&quot; is set up. Redirecting to your dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  const stepMeta = STEPS[currentStep - 1];
  const progressFraction = currentStep / STEPS.length;
  const stepsRemaining = STEPS.length - currentStep;

  return (
    <div className="min-h-[100dvh] md:min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20">
      <header className="shrink-0 flex items-center justify-between gap-2 px-4 pt-3 pb-2 md:p-6">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="md:hidden rounded-xl h-10 w-10 shrink-0 text-gray-700 dark:text-gray-200 active:scale-[0.97] disabled:opacity-30"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <Sprout className="h-7 w-7 md:h-8 md:w-8 text-primary-600 shrink-0" />
            <span className="text-lg md:text-2xl font-heading font-bold text-primary-600 truncate">
              FarmKeeper
            </span>
          </div>
        </div>
        <p className="md:hidden text-xs font-semibold text-gray-500 dark:text-gray-400 tabular-nums shrink-0">
          Step {currentStep} of {STEPS.length}
        </p>
        <div className="hidden md:flex items-center space-x-3 shrink-0">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {onboardingData.name || userName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
          </div>
          {userImage && (
            <img src={userImage} alt="" className="h-8 w-8 rounded-full" />
          )}
        </div>
      </header>

      {/* Mobile: progress */}
      <div className="md:hidden px-4 pb-3 space-y-2 shrink-0">
        <div className="h-2 rounded-full bg-gray-200/90 dark:bg-gray-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary-600"
            initial={false}
            animate={{ width: `${progressFraction * 100}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-center gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentStep > s.id
                  ? 'w-6 bg-primary-600'
                  : currentStep === s.id
                    ? 'w-6 bg-primary-400'
                    : 'w-1.5 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
        {stepsRemaining > 0 && (
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            {stepsRemaining === 1 ? 'Almost done!' : `Just ${stepsRemaining} more steps`}
          </p>
        )}
      </div>

      {/* Desktop: stepper */}
      <div className="hidden md:block px-4 sm:px-6 lg:px-8">
        <div className={`w-full mx-auto mb-8 ${currentStep === 3 ? 'max-w-5xl' : 'max-w-2xl'}`}>
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 min-w-[24px] ${
                      currentStep > step.id ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 md:block px-4 sm:px-6 lg:px-8 md:pb-12">
        <div
          className={`w-full mx-auto flex-1 flex flex-col min-h-0 md:flex-none ${
            currentStep === 3 ? 'max-w-5xl' : 'max-w-2xl'
          }`}
        >
          <Card
            className={`flex-1 flex flex-col min-h-0 overflow-hidden md:overflow-visible shadow-xl border-0 md:rounded-xl max-md:rounded-2xl max-md:bg-white/80 max-md:dark:bg-gray-900/50 max-md:backdrop-blur-sm max-md:border max-md:border-gray-200/80 max-md:dark:border-gray-700/80 max-md:shadow-lg ${
              currentStep === 3 ? 'md:bg-gray-900 md:dark:bg-gray-900 md:border md:border-gray-800' : ''
            }`}
          >
            <CardHeader
              className={`shrink-0 text-center pb-6 md:pb-8 max-md:pt-5 max-md:px-5 max-md:text-left md:px-6 ${
                currentStep === 3 ? 'md:border-b md:border-gray-800' : ''
              }`}
            >
              <div
                className={`flex max-md:justify-start justify-center mb-3 md:mb-4 ${
                  currentStep === 3 ? 'md:text-green-500' : stepMeta.color
                } max-md:text-primary-600`}
              >
                {(() => {
                  const Icon = stepMeta.icon;
                  return <Icon className="h-9 w-9 md:h-8 md:w-8" />;
                })()}
              </div>
              <CardTitle
                className={`text-xl md:text-2xl font-bold font-heading leading-tight ${
                  currentStep === 3 ? 'md:text-white' : 'text-gray-900 dark:text-white'
                }`}
              >
                {stepMeta.title}
              </CardTitle>
              <CardDescription
                className={`text-sm md:text-base mt-1.5 leading-relaxed ${
                  currentStep === 3 ? 'md:text-gray-400' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {stepMeta.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col min-h-0 overflow-y-auto md:overflow-visible md:space-y-6 px-4 pb-4 md:px-6 md:pb-6 max-md:pt-0 max-md:pb-[calc(8rem+env(safe-area-inset-bottom))]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="flex-1 md:flex-none"
                >
                  {currentStep === 1 && (
                    <div className="max-md:text-left text-center space-y-5 py-1 md:py-0">
                      <p className="text-gray-700 dark:text-gray-200 text-base leading-relaxed">
                        Hi <strong>{userName || 'there'}</strong> — in a few taps we&apos;ll set up your farm on
                        FarmKeeper.
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-3 max-md:rounded-2xl max-md:border max-md:border-gray-200/80 max-md:dark:border-gray-700 max-md:bg-white/60 max-md:dark:bg-gray-800/40 max-md:p-4">
                        <li className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 text-xs font-bold">
                            1
                          </span>
                          <span>Farm &amp; your name</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 text-xs font-bold">
                            2
                          </span>
                          <span>Choose your plan</span>
                        </li>
                      </ul>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-5 md:space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="farmName" className="text-sm font-medium">
                          Farm name *
                        </Label>
                        <Input
                          ref={farmNameInputRef}
                          id="farmName"
                          type="text"
                          required
                          placeholder="e.g., Green Valley Farm"
                          value={onboardingData.farmName}
                          onChange={(e) =>
                            setOnboardingData((prev) => ({ ...prev, farmName: e.target.value }))
                          }
                          className="text-base md:text-lg min-h-12 md:min-h-10 rounded-xl border-gray-300/90 dark:border-gray-600 focus-visible:ring-primary-500/50 transition-shadow [font-size:16px] md:[font-size:1.125rem]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yourName" className="text-sm font-medium">
                          Your name *
                        </Label>
                        <Input
                          id="yourName"
                          type="text"
                          required
                          placeholder="e.g., John Okello"
                          value={onboardingData.name}
                          onChange={(e) =>
                            setOnboardingData((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="text-base md:text-lg min-h-12 md:min-h-10 rounded-xl border-gray-300/90 dark:border-gray-600 focus-visible:ring-primary-500/50 transition-shadow [font-size:16px] md:[font-size:1.125rem]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm font-medium">
                          Country *
                        </Label>
                        <select
                          id="country"
                          value={onboardingData.countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-full min-h-12 rounded-xl border border-gray-300/90 bg-white px-3 py-2 text-base dark:border-gray-600 dark:bg-gray-900 [font-size:16px]"
                        >
                          {SUPPORTED_COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      {plans.map((plan) => {
                        const isSelected = onboardingData.plan === plan.id;
                        const isPro = plan.mostPopular;
                        return (
                          <div
                            key={plan.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setPlanId(plan.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setPlanId(plan.id);
                              }
                            }}
                            className={`relative flex flex-col rounded-2xl p-5 md:p-6 cursor-pointer transition-all duration-200 border-2 active:scale-[0.99] max-md:min-h-0 md:bg-gray-800/80 md:dark:bg-gray-800/90 max-md:bg-white max-md:dark:bg-gray-900 max-md:shadow-sm ${
                              isPro
                                ? 'border-primary-500 ring-2 ring-primary-500/25 shadow-md shadow-primary-500/10'
                                : isSelected
                                  ? 'border-primary-600 md:border-green-500 dark:border-green-500'
                                  : 'border-gray-200 dark:border-gray-700 md:border-gray-700 hover:border-gray-300 md:hover:border-gray-600 dark:hover:border-gray-600'
                            }`}
                          >
                            {plan.mostPopular && (
                              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                                <span className="inline-block px-3 py-0.5 rounded-full bg-primary-600 text-white text-[10px] font-bold uppercase tracking-wide">
                                  Most popular
                                </span>
                              </div>
                            )}
                            <div className="mb-3 md:mb-4">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white md:text-white">
                                {plan.name}
                              </h3>
                              <p className="mt-2 flex items-baseline gap-1">
                                <span className="text-2xl md:text-3xl font-bold text-primary-700 dark:text-primary-400 md:text-white">
                                  {plan.price}
                                </span>
                                <span className="text-gray-500 md:text-gray-400 text-sm">{plan.pricePeriod}</span>
                              </p>
                              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 md:text-gray-400">
                                {plan.description}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlanId(plan.id);
                              }}
                              className={`mt-auto w-full min-h-11 py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors active:scale-[0.99] ${
                                isPro
                                  ? 'bg-primary-600 text-white hover:bg-primary-700 md:bg-green-500 md:text-gray-900 md:hover:bg-green-400'
                                  : plan.id === 'enterprise'
                                    ? 'border-2 border-primary-600 text-primary-700 dark:text-primary-400 bg-transparent hover:bg-primary-500/10 md:border-green-500 md:text-green-500'
                                    : 'border-2 border-primary-500/80 text-primary-700 dark:text-primary-300 bg-transparent hover:bg-primary-500/10 md:border-green-600 md:text-green-600 dark:md:border-green-500 dark:md:text-green-500'
                              }`}
                            >
                              {plan.buttonLabel}
                            </button>
                            <div className="mt-4 md:mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 md:border-gray-700">
                              <p className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 md:mb-3">
                                {plan.featuresHeading}
                              </p>
                              <ul className="space-y-2">
                                {plan.features.map((f, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 md:text-gray-300"
                                  >
                                    <Check className="h-4 w-4 text-primary-600 md:text-green-500 shrink-0 mt-0.5" />
                                    <span>{f}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {error && (
                <div className="hidden md:block bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm mt-4">
                  {error}
                </div>
              )}

              <div
                className={`hidden md:flex justify-between pt-6 mt-auto ${
                  currentStep === 3 ? 'border-t border-gray-800' : ''
                }`}
              >
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                {currentStep < STEPS.length ? (
                  <Button onClick={handleNext} disabled={!isStepValid()} className="flex items-center space-x-2">
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={!isStepValid() || isLoading}
                    className="flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Setting up...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete setup</span>
                        <CheckCircle className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mobile: fixed bottom CTA (keyboard-safe scroll area above via CardContent padding) */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-gray-200/80 dark:border-gray-700/80 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md space-y-3 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.15)]">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2.5 rounded-xl text-sm">
                {error}
              </div>
            )}
            {currentStep === 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="w-full text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-1 active:opacity-70"
              >
                Skip intro
              </button>
            )}
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  className="min-h-12 rounded-xl px-4 shrink-0 active:scale-[0.98] transition-transform"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="flex-1 min-h-12 rounded-xl text-base font-semibold bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.99] transition-transform disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleComplete}
                  disabled={!isStepValid() || isLoading}
                  className="flex-1 min-h-12 rounded-xl text-base font-semibold bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.99] transition-transform disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Setting up…
                    </>
                  ) : (
                    <>
                      Complete setup
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
