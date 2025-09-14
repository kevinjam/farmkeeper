'use client';

import { useState, useEffect } from 'react';
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
  DollarSign
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
  basic: Plan;
  pro: Plan;
}

export default function BillingPage() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [plans, setPlans] = useState<Plans | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'ussd' | 'card'>('mobile_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'details' | 'processing' | 'success' | 'error'>('method');

  useEffect(() => {
    // For now, let's use mock data to test the UI
    // TODO: Replace with actual API calls once backend is running
    setTrialStatus({
      plan: 'trial',
      subscriptionStatus: 'active',
      livestockLimit: null,
      features: ['weather', 'marketPrices'],
      trialStartDate: new Date().toISOString(),
      daysLeft: 25,
      isTrialExpired: false,
      trialEndDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
    });

    setPlans({
      basic: {
        name: 'Basic Plan',
        price: 'UGX 1,500',
        period: 'month',
        livestockLimit: 10,
        features: ['weather', 'basic_analytics'],
        description: 'Perfect for small farms getting started'
      },
      pro: {
        name: 'Pro Plan',
        price: 'UGX 4,000',
        period: 'month',
        livestockLimit: null,
        features: ['weather', 'marketPrices', 'advanced_analytics', 'priority_support'],
        description: 'For progressive farmers and cooperatives'
      }
    });

    setIsLoading(false);

    // Uncomment these when backend is ready:
    // fetchTrialStatus();
    // fetchPlans();
  }, []);

  const fetchTrialStatus = async () => {
    try {
      const response = await apiClient.getTrialStatus();
      if (response.success) {
        setTrialStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching trial status:', error);
      setError('Failed to load trial status');
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await apiClient.getPlans();
      if (response.success) {
        setPlans(response.data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to load subscription plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (plan: 'basic' | 'pro') => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
    setPaymentStep('method');
    setPhoneNumber('');
    setPaymentMethod('mobile_money');
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
      // For demo purposes, simulate a successful payment
      // In production, this would call the actual API
      setTimeout(() => {
        if (paymentMethod === 'mobile_money') {
          // Simulate mobile money payment
          setPaymentStep('success');
        } else if (paymentMethod === 'ussd') {
          // Simulate USSD payment
          setPaymentStep('success');
        } else if (paymentMethod === 'card') {
          // Simulate card payment redirect
          setPaymentStep('success');
        }
        setIsProcessingPayment(false);
      }, 2000);

      // Uncomment this when backend is ready:
      /*
      const response = await apiClient.initiateSubscription({
        plan: selectedPlan,
        paymentMethod,
        phoneNumber: phoneNumber || undefined
      });

      if (response.success) {
        // Handle successful payment initiation
        if (response.data.paymentUrl) {
          // Redirect to Flutterwave payment page
          window.open(response.data.paymentUrl, '_blank');
          setPaymentStep('success');
        } else if (response.data.ussdCode) {
          // Show USSD code for manual payment
          setPaymentStep('success');
        }
      } else {
        setPaymentStep('error');
      }
      */
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStep('error');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Subscription & Billing
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose the perfect plan for your farm. Start with our 30-day free trial and upgrade when you're ready.
            </p>
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6"
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
            <Card className="border-2 border-primary-200 dark:border-primary-800">
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
            {/* Basic Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{plans.basic.name}</span>
                  <Badge variant="secondary">Popular</Badge>
                </CardTitle>
                <CardDescription>{plans.basic.description}</CardDescription>
                <div className="text-3xl font-bold text-primary-600">
                  {plans.basic.price}
                  <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                    /{plans.basic.period}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>
                        {plans.basic.livestockLimit === null 
                          ? 'Unlimited livestock records' 
                          : `${plans.basic.livestockLimit} livestock records`
                        }
                      </span>
                    </div>
                    {plans.basic.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {getFeatureIcon(feature)}
                        <span>{getFeatureName(feature)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubscribe('basic')}
                    disabled={isSubscribing && selectedPlan === 'basic'}
                  >
                    {isSubscribing && selectedPlan === 'basic' ? (
                      'Processing...'
                    ) : (
                      <>
                        Subscribe to Basic
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-primary-200 dark:border-primary-800">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary-600 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Best Value
                </Badge>
              </div>
              <CardHeader>
                <CardTitle>{plans.pro.name}</CardTitle>
                <CardDescription>{plans.pro.description}</CardDescription>
                <div className="text-3xl font-bold text-primary-600">
                  {plans.pro.price}
                  <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                    /{plans.pro.period}
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
                    {plans.pro.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {getFeatureIcon(feature)}
                        <span>{getFeatureName(feature)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => handleSubscribe('pro')}
                    disabled={isSubscribing && selectedPlan === 'pro'}
                  >
                    {isSubscribing && selectedPlan === 'pro' ? (
                      'Processing...'
                    ) : (
                      <>
                        Subscribe to Pro
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
          <Card>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">MTN Mobile Money</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">*165*99#</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium">Airtel Money</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">*185*99#</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
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
                      className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
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
                          Secure Card Payment
                        </span>
                      </div>
                      <div className="text-sm text-purple-800 dark:text-purple-300">
                        <p>You will be redirected to a secure payment page to enter your card details.</p>
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
                      disabled={paymentMethod === 'mobile_money' && !phoneNumber}
                    >
                      Continue Payment
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
                  <Button onClick={closePaymentModal} className="w-full">
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