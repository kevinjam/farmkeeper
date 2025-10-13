'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Crown, 
  Star,
  Lock,
  Unlock,
  ArrowRight,
  Calendar,
  Users,
  BarChart3,
  DollarSign,
  Settings,
  Cloud,
  Leaf,
  Egg,
  TrendingUp,
  Loader2
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
  popular?: boolean;
  limitations?: string[];
}

interface Plans {
  free: Plan;
  trial: Plan;
  premium: Plan;
}

interface SubscriptionStatus {
  plan: 'free' | 'trial' | 'premium';
  subscriptionStatus: 'active' | 'expired' | 'canceled' | 'trial';
  livestockLimit: number | null;
  features: string[];
  daysLeft: number;
  isExpired: boolean;
  subscriptionEndDate?: string;
  nextBillingDate?: string;
  autoRenew: boolean;
}

export default function SubscriptionPage({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  const [plans, setPlans] = useState<Plans | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansResponse, statusResponse] = await Promise.all([
        apiClient.getPlans(),
        apiClient.getSubscriptionStatus()
      ]);

      if (plansResponse.success) {
        setPlans(plansResponse.data);
      }

      if (statusResponse.success) {
        setSubscriptionStatus(statusResponse.data);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      setError('Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (plan: 'premium') => {
    console.log('[Subscription] Starting upgrade to plan:', plan);
    console.log('[Subscription] Farm ID:', farmId);
    setIsUpgrading(true);
    try {
      // Redirect to billing page for payment with correct farmId
      const billingUrl = `/${farmId}/dashboard/billing`;
      console.log('[Subscription] Redirecting to:', billingUrl);
      window.location.href = billingUrl;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      setError('Failed to upgrade subscription');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      return;
    }

    setIsCanceling(true);
    try {
      const response = await apiClient.cancelSubscription();
      if (response.success) {
        await fetchData(); // Refresh data
        alert('Subscription canceled successfully. You now have access to the Free plan.');
      } else {
        setError(response.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setError('Failed to cancel subscription');
    } finally {
      setIsCanceling(false);
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'livestock':
        return <Users className="h-4 w-4" />;
      case 'crops':
        return <Leaf className="h-4 w-4" />;
      case 'finances':
        return <DollarSign className="h-4 w-4" />;
      case 'feed_management':
        return <BarChart3 className="h-4 w-4" />;
      case 'eggs_sales':
        return <Egg className="h-4 w-4" />;
      case 'weather':
        return <Cloud className="h-4 w-4" />;
      case 'analytics':
        return <TrendingUp className="h-4 w-4" />;
      case 'billing':
        return <DollarSign className="h-4 w-4" />;
      case 'settings':
        return <Settings className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'livestock':
        return 'Livestock Management';
      case 'crops':
        return 'Crop Management';
      case 'finances':
        return 'Financial Tracking';
      case 'feed_management':
        return 'Feed Management';
      case 'eggs_sales':
        return 'Eggs & Sales';
      case 'weather':
        return 'Weather Forecast';
      case 'analytics':
        return 'Advanced Analytics';
      case 'billing':
        return 'Billing Management';
      case 'settings':
        return 'Farm Settings';
      default:
        return feature;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select the perfect plan for your farm management needs. Start free and upgrade anytime.
          </p>
        </div>

        {/* Current Status */}
        {subscriptionStatus && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <Crown className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Current Plan: {subscriptionStatus.plan.charAt(0).toUpperCase() + subscriptionStatus.plan.slice(1)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {subscriptionStatus.plan === 'free' && 'Basic features for small farms'}
                        {subscriptionStatus.plan === 'trial' && `${subscriptionStatus.daysLeft} days left in trial`}
                        {subscriptionStatus.plan === 'premium' && 'Full access to all features'}
                      </p>
                    </div>
                  </div>
                  {subscriptionStatus.plan === 'premium' && (
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isCanceling}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      {isCanceling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel Subscription'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Plans */}
        {plans && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="relative h-full">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plans.free.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {plans.free.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plans.free.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      /{plans.free.period}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Features:</h4>
                    {plans.free.features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {getFeatureName(feature)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {plans.free.limitations && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Limitations:</h4>
                      {plans.free.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {limitation}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    className="w-full"
                    variant={subscriptionStatus?.plan === 'free' ? 'default' : 'outline'}
                    disabled={subscriptionStatus?.plan === 'free'}
                  >
                    {subscriptionStatus?.plan === 'free' ? 'Current Plan' : 'Downgrade to Free'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Trial Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="relative h-full">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plans.trial.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {plans.trial.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plans.trial.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      /{plans.trial.period}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Features:</h4>
                    {plans.trial.features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {getFeatureName(feature)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    variant={subscriptionStatus?.plan === 'trial' ? 'default' : 'outline'}
                    disabled={subscriptionStatus?.plan === 'trial'}
                  >
                    {subscriptionStatus?.plan === 'trial' ? 'Current Plan' : 'Start Trial'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="relative h-full border-2 border-primary-500">
                {plans.premium.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary-500 text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plans.premium.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {plans.premium.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plans.premium.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      /{plans.premium.period}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Features:</h4>
                    {plans.premium.features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {getFeatureName(feature)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    variant={subscriptionStatus?.plan === 'premium' ? 'default' : 'default'}
                    disabled={subscriptionStatus?.plan === 'premium' || isUpgrading}
                    onClick={() => handleUpgrade('premium')}
                  >
                    {isUpgrading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : subscriptionStatus?.plan === 'premium' ? (
                      'Current Plan'
                    ) : (
                      <>
                        Upgrade to Premium
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Feature Comparison */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Feature Comparison
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                      Features
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                      Free
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                      Trial
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    'livestock', 'crops', 'finances', 'feed_management', 
                    'eggs_sales', 'weather', 'analytics', 'billing', 'settings'
                  ].map((feature) => (
                    <tr key={feature}>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          {getFeatureIcon(feature)}
                          <span>{getFeatureName(feature)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {plans?.free.features.includes(feature) ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {plans?.trial.features.includes(feature) ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {plans?.premium.features.includes(feature) ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What happens after my trial ends?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                After your 30-day trial, you'll automatically be moved to the Free plan unless you upgrade to Premium.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How do I cancel my subscription?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You can cancel your subscription anytime from your account settings. You'll retain access until the end of your billing period.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We accept Mobile Money (MTN, Airtel), USSD payments, and will soon support card payments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
