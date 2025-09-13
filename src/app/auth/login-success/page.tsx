'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function LoginSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(3);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const farmSlug = searchParams.get('farmSlug') || localStorage.getItem('farmSlug');
  const farmName = searchParams.get('farmName') || localStorage.getItem('farmName');

  const redirectToDashboard = useCallback(() => {
    if (farmSlug && !isRedirecting) {
      setIsRedirecting(true);
      const dashboardUrl = `/${farmSlug}/dashboard`;
      console.log('Redirecting to dashboard:', dashboardUrl);
      
      // Use router.push for client-side navigation
      router.push(dashboardUrl);
    }
  }, [farmSlug, isRedirecting, router]);

  useEffect(() => {
    if (!farmSlug) {
      console.log('No farm slug found, redirecting to login');
      router.push('/auth/login');
      return;
    }

    // Countdown before redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [farmSlug, router]);

  // Separate useEffect to handle redirect when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && farmSlug && !isRedirecting) {
      redirectToDashboard();
    }
  }, [countdown, farmSlug, isRedirecting, redirectToDashboard]);

  const handleManualRedirect = () => {
    redirectToDashboard();
  };

  if (!farmSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Login Successful!
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                  Welcome back!
                </h3>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {farmName ? `You're now logged into ${farmName}` : 'You\'re now logged in'}
                </p>
              </div>

              {isRedirecting ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Redirecting to dashboard...
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Redirecting to your dashboard in {countdown} second{countdown !== 1 ? 's' : ''}...
                  </p>
                  
                  <Button 
                    onClick={handleManualRedirect} 
                    className="w-full" 
                    size="lg"
                    disabled={isRedirecting}
                  >
                    {isRedirecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      <>
                        Continue to Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Loading component for Suspense fallback
function LoginSuccessLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading...</p>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function LoginSuccess() {
  return (
    <Suspense fallback={<LoginSuccessLoading />}>
      <LoginSuccessContent />
    </Suspense>
  );
}