'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Smartphone, 
  Wifi,
  TrendingUp,
  Shield,
  Star,
  ArrowRight,
  Calendar,
  Users,
  BarChart3,
  X,
  Loader2,
  Phone,
  DollarSign,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';

interface Plan {
  name: string;
  price: string;
  period: string;
  livestockLimit: number | null;
  features: string[];
  description: string;
  popular?: boolean;
  limitations?: string[];
}

interface TrialStatus {
  plan: string;
  subscriptionStatus: string;
  livestockLimit: number | null;
  features: string[];
  trialStartDate: string;
  daysLeft: number;
  isTrialExpired: boolean;
  trialEndDate: string;
}

interface Plans {
  free: Plan;
  trial: Plan;
  premium: Plan;
}

export default function BillingPage({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  const router = useRouter();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [plans, setPlans] = useState<Plans | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'premium' | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'ussd' | 'card'>('mobile_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'details' | 'processing' | 'success' | 'error'>('method');

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Check if user has a valid token
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setIsAuthenticated(false);
        setAuthChecked(true);
        return;
      }

      // Test the token by making a simple API call
      const response = await apiClient.getSubscriptionStatus();
      if (response.success) {
        setIsAuthenticated(true);
        setTrialStatus(response.data);
        // Fetch plans after successful auth
        await fetchPlans();
      } else {
        setIsAuthenticated(false);
        // Clear invalid token
        localStorage.removeItem('auth-token');
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('auth-token');
    } finally {
      setAuthChecked(true);
      setIsLoading(false);
    }
  };

  const fetchTrialStatus = async () => {
    try {
      const response = await apiClient.getSubscriptionStatus();
      if (response.success) {
        setTrialStatus(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching subscription status:', error);
      if (error.message?.includes('Token is not valid') || error.message?.includes('Authentication')) {
        setError('Please log in to view your subscription status');
      } else {
        setError('Failed to load subscription status');
      }
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await apiClient.getPlans();
      if (response.success) {
        setPlans(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      if (error.message?.includes('Token is not valid') || error.message?.includes('Authentication')) {
        setIsAuthenticated(false);
        localStorage.removeItem('auth-token');
      } else {
        setError('Failed to load subscription plans');
      }
    }
  };

  const handleSubscribe = async (plan: 'premium') => {
    console.log('[Billing] Starting subscription for plan:', plan);
    setSelectedPlan(plan);
    setShowPaymentModal(true);
    setPaymentStep('method');
    setPhoneNumber('');
    setPaymentMethod('mobile_money');
    console.log('[Billing] Payment modal opened');
  };

  const handlePaymentMethodSelect = (method: 'mobile_money' | 'ussd' | 'card') => {
    setPaymentMethod(method);
    setPaymentStep('details');
  };

  const handlePaymentSubmit = async () => {
    if (!selectedPlan) return;
    
    setIsProcessingPayment(true);
    setPaymentStep('processing');
    
    try {
      // Call the actual API to initiate Flutterwave payment
      const response = await apiClient.initiateSubscription({
        plan: selectedPlan,
        paymentMethod,
        phoneNumber: phoneNumber || undefined
      });

      if (response.success) {
        // Handle successful payment initiation
        if (response.data.paymentUrl) {
          // Redirect to Flutterwave payment page in new tab
          const paymentWindow = window.open(response.data.paymentUrl, '_blank', 'width=800,height=600');
          
          // Monitor the payment window
          const checkClosed = setInterval(async () => {
            if (paymentWindow?.closed) {
              clearInterval(checkClosed);
              // Check actual payment status after window closes
              setTimeout(async () => {
                const isPaymentCompleted = await checkPaymentStatus(response.data.reference);
                if (isPaymentCompleted) {
                  setPaymentStep('success');
                } else {
                  setPaymentStep('error');
                }
                setIsProcessingPayment(false);
              }, 2000); // Wait 2 seconds for webhook to process
            }
          }, 1000);
          
        } else if (response.data.ussdCode) {
          // Show USSD code for manual payment
          setPaymentStep('success');
          setIsProcessingPayment(false);
        } else {
          // Direct success for other payment methods
          setPaymentStep('success');
          setIsProcessingPayment(false);
        }
      } else {
        setPaymentStep('error');
        setIsProcessingPayment(false);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      if (error.message?.includes('Token is not valid') || error.message?.includes('Authentication')) {
        setIsAuthenticated(false);
        localStorage.removeItem('auth-token');
        setError('Your session has expired. Please log in again.');
        setPaymentStep('error');
      } else {
        setError('Payment failed. Please try again.');
        setPaymentStep('error');
      }
      setIsProcessingPayment(false);
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    setPaymentStep('method');
    setPhoneNumber('');
    setPaymentMethod('mobile_money');
    setIsProcessingPayment(false);
  };

  const checkPaymentStatus = async (reference: string) => {
    try {
      // Check payment status with backend
      const response = await apiClient.get(`/billing/payment-status/${reference}`);
      if (response.success && response.data.status === 'completed') {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
  };

  const handleContinueToDashboard = async () => {
    // Refresh subscription status before closing modal
    await fetchTrialStatus();
    closePaymentModal();
    
    // Set a flag to refresh subscription status in dashboard
    localStorage.setItem('refreshSubscription', 'true');
    
    // Redirect to dashboard to show updated features
    window.location.href = `/${farmId}/dashboard`;
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'weather':
        return <Wifi className="h-4 w-4" />;
      case 'marketPrices':
        return <TrendingUp className="h-4 w-4" />;
      case 'advanced_analytics':
        return <BarChart3 className="h-4 w-4" />;
      case 'priority_support':
        return <Shield className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'weather':
        return 'Weather Updates';
      case 'marketPrices':
        return 'Market Prices';
      case 'advanced_analytics':
        return 'Advanced Analytics';
      case 'priority_support':
        return 'Priority Support';
      default:
        return feature;
    }
  };

  // Authentication guard
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-md mx-auto"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Authentication Required
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You need to be logged in to access the billing and subscription features.
                </p>
                <Button 
                  onClick={() => router.push('/auth/login')}
                  className="w-full"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Go to Login
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading billing information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))]">
      <div className="container mx-auto px-3 py-6 sm:px-4 md:py-8">
        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200/90 bg-white/90 shadow-md backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90 md:mb-8 md:rounded-xl md:text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-md:bg-gradient-to-br max-md:from-emerald-500/12 max-md:via-white max-md:to-white max-md:p-5 max-md:dark:from-emerald-500/12 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-8"
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-4xl">Subscription &amp; billing</h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-snug text-gray-600 dark:text-gray-300 md:mx-auto md:mt-4 md:text-lg">
              Choose the perfect plan for your farm. Start with our 30-day free trial and upgrade when you&apos;re ready.
            </p>
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 md:rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Trial Status */}
        {trialStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="border-2 border-primary-200 dark:border-primary-800 max-md:rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary-600" />
                  Trial Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {trialStatus.daysLeft}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Days Left
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge 
                      variant={trialStatus.isTrialExpired ? "destructive" : "default"}
                      className="text-sm"
                    >
                      {trialStatus.isTrialExpired ? 'Expired' : 'Active'}
                    </Badge>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Current Plan
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Trial Ends
                    </div>
                    <div className="text-sm font-medium">
                      {new Date(trialStatus.trialEndDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {trialStatus.isTrialExpired && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Trial Expired</span>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Your free trial has ended. Subscribe to a plan to continue using FarmKeeper.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Subscription Plans */}
        {plans && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            {/* Premium Plan */}
            <Card className="relative border-2 border-primary-200 dark:border-primary-800 max-md:rounded-2xl max-md:shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary-600 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Best Value
                </Badge>
              </div>
              <CardHeader>
                <CardTitle>{plans.premium.name}</CardTitle>
                <CardDescription>{plans.premium.description}</CardDescription>
                <div className="text-3xl font-bold text-primary-600">
                  {plans.premium.price}
                  <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                    /{plans.premium.period}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>Unlimited livestock records</span>
                    </div>
                    {plans.premium.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {getFeatureIcon(feature)}
                        <span>{getFeatureName(feature)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full max-md:min-h-12 max-md:rounded-xl" 
                    variant="default"
                    onClick={() => handleSubscribe('premium')}
                    disabled={isSubscribing && selectedPlan === 'premium'}
                  >
                    {isSubscribing && selectedPlan === 'premium' ? (
                      'Processing...'
                    ) : (
                      <>
                        Subscribe to Premium
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="max-md:rounded-2xl max-md:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary-600" />
                Payment Methods
              </CardTitle>
              <CardDescription>
                Secure payments powered by Flutterwave
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                    <Smartphone className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">MTN Mobile Money</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">*165*99#</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                    <Smartphone className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium">Airtel Money</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">*185*99#</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Card Payment</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Visa, Mastercard</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Professional Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center md:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-gray-800 md:mx-4 md:rounded-xl md:p-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Complete Your Subscription
                </h2>
                <button
                  onClick={closePaymentModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Plan Summary */}
              {selectedPlan && plans && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                     <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {plans[selectedPlan].name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {plans[selectedPlan].description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        {plans[selectedPlan].price}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        /{plans[selectedPlan].period}
                      </div>
                    </div>
                    </div>
                </div>
              )}

              {/* Payment Steps */}
              {paymentStep === 'method' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Choose Payment Method
                  </h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => handlePaymentMethodSelect('mobile_money')}
                      className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            Mobile Money
            </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            MTN Mobile Money, Airtel Money
            </div>
        </div>
    </div>
                    </button>

                    <button
                      onClick={() => handlePaymentMethodSelect('ussd')}
                      className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <Phone className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            USSD Code
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Dial *165*99# or *185*99#
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handlePaymentMethodSelect('card')}
                      className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors relative"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            Card Payment
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Visa, Mastercard
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          Coming Soon
                        </Badge>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'details' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Payment Details
                  </h3>
                  
                  {paymentMethod === 'mobile_money' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+256 771 234 567"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Enter your MTN or Airtel phone number
        </p>
      </div>
                    </div>
                  )}

                  {paymentMethod === 'ussd' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Phone className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900 dark:text-blue-200">
                          USSD Payment Instructions
                        </span>
                      </div>
                      <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                        <p>1. Dial <strong>*165*99#</strong> for MTN or <strong>*185*99#</strong> for Airtel</p>
                        <p>2. Follow the prompts to complete payment</p>
                        <p>3. Your subscription will be activated automatically</p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-purple-900 dark:text-purple-200">
                          Card Payment Coming Soon
                        </span>
                      </div>
                      <div className="text-sm text-purple-800 dark:text-purple-300">
                        <p>Card payments will be available soon. Please use Mobile Money or USSD for now.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setPaymentStep('method')}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handlePaymentSubmit}
                      className="flex-1"
                      disabled={
                        (paymentMethod === 'mobile_money' && !phoneNumber) ||
                        paymentMethod === 'card'
                      }
                    >
                      {paymentMethod === 'card' ? 'Coming Soon' : 'Continue Payment'}
                    </Button>
                  </div>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="text-center py-8">
                  <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Processing Payment
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please wait while we process your payment...
                  </p>
      </div>
              )}

              {paymentStep === 'success' && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Your subscription has been activated. You can now access all features.
                  </p>
                  <Button onClick={handleContinueToDashboard} className="w-full">
                    Continue to Dashboard
                  </Button>
            </div>
              )}

              {paymentStep === 'error' && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Payment Failed
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    There was an error processing your payment. Please try again.
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setPaymentStep('method')}
                      className="flex-1"
                    >
                      Try Again
                    </Button>
                    <Button onClick={closePaymentModal} className="flex-1">
                      Cancel
                    </Button>
            </div>
        </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 