'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, ArrowRight, ArrowLeft, CheckCircle, MapPin, CreditCard, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationSelector } from '@/components/LocationSelector';
import { useSession } from 'next-auth/react';

interface OnboardingData {
  farmName: string;
  plan: string;
  location: {
    address?: string;
    district?: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

interface GoogleOnboardingProps {
  userEmail: string;
  userName: string;
  userImage?: string;
}

export function GoogleOnboarding({ userEmail, userName, userImage }: GoogleOnboardingProps) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    farmName: '',
    plan: 'trial',
    location: {
      country: 'Uganda'
    }
  });

  const steps = [
    {
      id: 1,
      title: 'Welcome to FarmKeeper!',
      description: 'Let\'s set up your farm profile',
      icon: <Sprout className="h-8 w-8" />,
      color: 'text-green-600'
    },
    {
      id: 2,
      title: 'Farm Information',
      description: 'Tell us about your farm',
      icon: <Building className="h-8 w-8" />,
      color: 'text-blue-600'
    },
    {
      id: 3,
      title: 'Choose Your Plan',
      description: 'Select the plan that fits your needs',
      icon: <CreditCard className="h-8 w-8" />,
      color: 'text-purple-600'
    },
    {
      id: 4,
      title: 'Farm Location',
      description: 'Help us provide local weather and recommendations',
      icon: <MapPin className="h-8 w-8" />,
      color: 'text-orange-600'
    }
  ];

  const handleLocationChange = (location: any) => {
    setOnboardingData(prev => ({
      ...prev,
      location: {
        address: location.address || '',
        district: location.district || '',
        country: location.country || 'Uganda',
        coordinates: location.coordinates
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5001'}/api/auth/complete-google-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          name: userName,
          image: userImage,
          farmName: onboardingData.farmName,
          plan: onboardingData.plan,
          location: onboardingData.location
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete registration');
      }

      setSuccess(true);
      
      // Update the session to mark onboarding as complete
      await update();
      
      // Redirect to dashboard after showing success
      setTimeout(() => {
        const farmSlug = data.farm?.slug || data.farmId;
        router.push(`/${farmSlug}/dashboard`);
      }, 2000);

    } catch (error: any) {
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return true; // Welcome step
      case 2:
        return onboardingData.farmName.trim().length > 0;
      case 3:
        return onboardingData.plan.length > 0;
      case 4:
        return onboardingData.location.country.length > 0;
      default:
        return false;
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 max-w-md mx-auto p-8"
        >
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome to FarmKeeper! 🌱
            </h2>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <p className="text-green-800 dark:text-green-200 mb-4">
                <strong>Registration successful!</strong> Your farm "{onboardingData.farmName}" is now set up.
              </p>
              <p className="text-sm text-green-600 dark:text-green-300">
                Redirecting to your dashboard...
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <Sprout className="h-8 w-8 text-primary-600" />
          <span className="text-2xl font-heading font-bold text-primary-600">FarmKeeper</span>
        </div>
        
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
          </div>
          {userImage && (
            <img
              src={userImage}
              alt={userName}
              className="h-8 w-8 rounded-full"
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-12">
        <div className="w-full max-w-2xl">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id
                        ? 'bg-primary-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-8">
              <div className={`flex justify-center mb-4 ${steps[currentStep - 1].color}`}>
                {steps[currentStep - 1].icon}
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white font-heading">
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                {steps[currentStep - 1].description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && (
                    <div className="text-center space-y-6">
                      <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-300">
                          Hi <strong>{userName}</strong>! We're excited to have you join FarmKeeper.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          Let's set up your farm profile so you can start managing your operations efficiently.
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <p className="text-blue-800 dark:text-blue-200 text-sm">
                            <strong>What we'll collect:</strong>
                          </p>
                          <ul className="text-blue-700 dark:text-blue-300 text-sm mt-2 space-y-1">
                            <li>• Your farm name and details</li>
                            <li>• Subscription plan preference</li>
                            <li>• Farm location for weather and recommendations</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Farm Name *</Label>
                        <Input
                          id="farmName"
                          type="text"
                          required
                          placeholder="e.g., Green Valley Farm"
                          value={onboardingData.farmName}
                          onChange={(e) => setOnboardingData(prev => ({ ...prev, farmName: e.target.value }))}
                          className="text-lg"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          This will be your farm's display name in FarmKeeper
                        </p>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="grid gap-4">
                        {[
                          {
                            id: 'trial',
                            name: 'Free Trial',
                            price: '14 days free',
                            description: 'Perfect for getting started',
                            features: ['Basic farm management', 'Up to 50 livestock', 'Basic reporting']
                          },
                          {
                            id: 'pro',
                            name: 'Pro Plan',
                            price: 'UGX 75,000/month',
                            description: 'For growing farms',
                            features: ['Advanced analytics', 'Unlimited livestock', 'Weather integration', 'Priority support']
                          },
                          {
                            id: 'enterprise',
                            name: 'Enterprise',
                            price: 'UGX 150,000/month',
                            description: 'For large operations',
                            features: ['All Pro features', 'Multi-farm management', 'Custom integrations', 'Dedicated support']
                          }
                        ].map((plan) => (
                          <div
                            key={plan.id}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              onboardingData.plan === plan.id
                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setOnboardingData(prev => ({ ...prev, plan: plan.id }))}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{plan.description}</p>
                                <p className="text-lg font-bold text-primary-600">{plan.price}</p>
                              </div>
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                onboardingData.plan === plan.id
                                  ? 'border-primary-600 bg-primary-600'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}>
                                {onboardingData.plan === plan.id && (
                                  <div className="w-full h-full rounded-full bg-white scale-50" />
                                )}
                              </div>
                            </div>
                            <ul className="mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                              {plan.features.map((feature, index) => (
                                <li key={index}>• {feature}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-300">
                        Help us provide accurate weather forecasts and local farming recommendations by setting your farm's location.
                      </p>
                      <LocationSelector
                        initialLocation={onboardingData.location}
                        onLocationChange={handleLocationChange}
                        required={true}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className="flex items-center space-x-2"
                  >
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Setting up...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Setup</span>
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
