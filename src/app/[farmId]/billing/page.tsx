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
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  useEffect(() => {
    fetchTrialStatus();
    fetchPlans();
  }, []);

  const fetchTrialStatus = async () => {
    try {
      const response = await apiClient.get('/billing/trial-status');
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
      const response = await apiClient.get('/billing/plans');
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
    setIsSubscribing(true);
    setSelectedPlan(plan);
    
    try {
      const response = await apiClient.post('/billing/subscribe', {
        plan,
        paymentMethod: 'mobile_money',
        phoneNumber: '' // This would be collected from user input
      });

      if (response.success) {
        // In a real implementation, this would redirect to Flutterwave payment
        alert(`Payment initiated for ${plan} plan. Complete payment via mobile money to activate subscription.`);
      }
    } catch (error) {
      console.error('Error initiating subscription:', error);
      setError('Failed to initiate subscription');
    } finally {
      setIsSubscribing(false);
      setSelectedPlan(null);
    }
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
      </div>
    </div>
  );
}
