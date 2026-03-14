'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, ArrowRight, ArrowLeft, CheckCircle, CreditCard, Building, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

interface OnboardingData {
  farmName: string;
  name: string;
  plan: string;
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

const PLANS = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: '$0',
    pricePeriod: '/month',
    description: 'Perfect for side projects and learning the platform basics.',
    buttonLabel: 'Choose Free Plan',
    featuresHeading: 'INCLUDES:',
    features: ['3 active projects', 'Basic analytics dashboard', 'Community support forum', '1GB cloud storage'],
    mostPopular: false,
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '$49',
    pricePeriod: '/month',
    description: 'Everything you need to grow your small business or agency.',
    buttonLabel: 'Choose Pro Plan',
    featuresHeading: 'EVERYTHING IN FREE, PLUS:',
    features: ['Unlimited active projects', 'Advanced real-time analytics', 'Priority email support (24h)', '20GB cloud storage', 'Custom domain mapping'],
    mostPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99',
    pricePeriod: '/month',
    description: 'Bespoke solutions for high-volume organizations and teams.',
    buttonLabel: 'Contact Sales',
    featuresHeading: 'EVERYTHING IN PRO, PLUS:',
    features: ['Unlimited storage & members', 'Dedicated account manager', '24/7 priority phone support', 'SSO & Enterprise security', 'Custom legal contracts'],
    mostPopular: false,
  },
];

export function GoogleOnboarding({ userEmail, userName, userImage }: GoogleOnboardingProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    farmName: '',
    name: userName || '',
    plan: 'trial',
  });

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

      const response = await fetch(`${BACKEND_URL}/api/auth/complete-google-signup`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: userEmail,
          name: onboardingData.name.trim(),
          image: userImage,
          farmName: onboardingData.farmName.trim(),
          plan: onboardingData.plan,
          location: { country: 'Uganda' },
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md mx-auto p-8"
        >
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile complete</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your farm &quot;{onboardingData.farmName}&quot; is set up. Redirecting to your dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <Sprout className="h-8 w-8 text-primary-600" />
          <span className="text-2xl font-heading font-bold text-primary-600">FarmKeeper</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{onboardingData.name || userName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
          </div>
          {userImage && (
            <img src={userImage} alt={userName} className="h-8 w-8 rounded-full" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-12">
        <div className={`w-full ${currentStep === 3 ? 'max-w-5xl' : 'max-w-2xl'}`}>
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
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
                );
              })}
            </div>
          </div>

          <Card className={`shadow-xl border-0 ${currentStep === 3 ? 'bg-gray-900 dark:bg-gray-900 border border-gray-800' : ''}`}>
            <CardHeader className={`text-center pb-8 ${currentStep === 3 ? 'border-b border-gray-800' : ''}`}>
              <div className={`flex justify-center mb-4 ${currentStep === 3 ? 'text-green-500' : STEPS[currentStep - 1].color}`}>
                {(() => {
                  const Icon = STEPS[currentStep - 1].icon;
                  return <Icon className="h-8 w-8" />;
                })()}
              </div>
              <CardTitle className={`text-2xl font-bold font-heading ${currentStep === 3 ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {STEPS[currentStep - 1].title}
              </CardTitle>
              <CardDescription className={`text-base ${currentStep === 3 ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                {STEPS[currentStep - 1].description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentStep === 1 && (
                    <div className="text-center space-y-4">
                      <p className="text-gray-600 dark:text-gray-300">
                        Hi <strong>{userName || 'there'}</strong>! Complete this short form to start using FarmKeeper.
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 text-left list-disc list-inside">
                        <li>Farm name</li>
                        <li>Your display name</li>
                        <li>Subscription plan</li>
                      </ul>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Farm name *</Label>
                        <Input
                          id="farmName"
                          type="text"
                          required
                          placeholder="e.g., Green Valley Farm"
                          value={onboardingData.farmName}
                          onChange={(e) =>
                            setOnboardingData((prev) => ({ ...prev, farmName: e.target.value }))
                          }
                          className="text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yourName">Your name *</Label>
                        <Input
                          id="yourName"
                          type="text"
                          required
                          placeholder="e.g., John Okello"
                          value={onboardingData.name}
                          onChange={(e) =>
                            setOnboardingData((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="text-lg"
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {PLANS.map((plan) => {
                        const isSelected = onboardingData.plan === plan.id;
                        const isPro = plan.mostPopular;
                        return (
                          <div
                            key={plan.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setOnboardingData((prev) => ({ ...prev, plan: plan.id }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setOnboardingData((prev) => ({ ...prev, plan: plan.id }));
                              }
                            }}
                            className={`relative flex flex-col rounded-xl p-6 cursor-pointer transition-all border-2 bg-gray-800/80 dark:bg-gray-800/90 ${
                              isPro
                                ? 'border-green-500 ring-2 ring-green-500/30 shadow-lg shadow-green-500/10'
                                : isSelected
                                  ? 'border-green-500 dark:border-green-500'
                                  : 'border-gray-700 dark:border-gray-700 hover:border-gray-600 dark:hover:border-gray-600'
                            }`}
                          >
                            {plan.mostPopular && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="inline-block px-3 py-0.5 rounded-full bg-green-500 text-white text-xs font-semibold uppercase tracking-wide">
                                  Most Popular
                                </span>
                              </div>
                            )}
                            <div className="mb-4">
                              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                              <p className="mt-2 flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-white">{plan.price}</span>
                                <span className="text-gray-400 text-sm">{plan.pricePeriod}</span>
                              </p>
                              <p className="mt-2 text-sm text-gray-400">{plan.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOnboardingData((prev) => ({ ...prev, plan: plan.id }));
                              }}
                              className={`mt-auto w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                                isPro
                                  ? 'bg-green-500 text-gray-900 hover:bg-green-400'
                                  : plan.id === 'enterprise'
                                    ? 'border-2 border-green-500 text-green-500 bg-transparent hover:bg-green-500/10'
                                    : 'border border-green-600 text-green-600 dark:border-green-500 dark:text-green-500 bg-transparent hover:bg-green-500/10'
                              }`}
                            >
                              {plan.buttonLabel}
                            </button>
                            <div className="mt-6 pt-4 border-t border-gray-700">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                {plan.featuresHeading}
                              </p>
                              <ul className="space-y-2">
                                {plan.features.map((f, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
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
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className={`flex justify-between pt-6 ${currentStep === 3 ? 'border-t border-gray-800' : ''}`}>
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
        </div>
      </div>
    </div>
  );
}
