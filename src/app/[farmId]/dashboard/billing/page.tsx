'use client';

import { useState } from 'react';

const PricingTier = ({
  plan,
  price,
  features,
  isPopular = false,
  onSelect,
}: {
  plan: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  onSelect: () => void;
}) => (
  <div className={`rounded-lg shadow-lg p-8 relative ${isPopular ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800'}`}>
    {isPopular && (
      <div className="absolute top-0 -translate-y-1/2 px-3 py-1 text-sm font-semibold tracking-wide text-white bg-green-500 rounded-full shadow-md">
        Most Popular
      </div>
    )}
    <h3 className="text-2xl font-bold">{plan}</h3>
    <p className="mt-4 text-4xl font-extrabold">{price}<span className="text-base font-medium">/mo</span></p>
    <ul className="mt-8 space-y-4">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <svg className={`flex-shrink-0 w-6 h-6 ${isPopular ? 'text-green-300' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="ml-3">{feature}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={onSelect}
      className={`w-full mt-10 py-3 px-6 text-lg font-semibold rounded-lg shadow-md transition-transform duration-300 transform hover:scale-105 ${
        isPopular ? 'bg-white text-primary-600 hover:bg-gray-100' : 'bg-primary-600 text-white hover:bg-primary-700'
      }`}
    >
      Choose Plan
    </button>
  </div>
);

const PaymentModal = ({ plan, onClose }: { plan: string; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Subscribe to {plan}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Enter your payment details to get started.</p>
            {/* Placeholder for a real payment form (e.g., Stripe Elements) */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Card Number</label>
                    <div className="mt-1 p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600">•••• •••• •••• 4242</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
                        <div className="mt-1 p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600">MM / YY</div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVC</label>
                        <div className="mt-1 p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600">•••</div>
                    </div>
                </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
                <button onClick={onClose} className="py-2 px-4 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                <button className="py-2 px-4 rounded-md text-white bg-primary-600 hover:bg-primary-700">Confirm Payment</button>
            </div>
        </div>
    </div>
);


export default function BillingPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    setShowModal(true);
  };

  const pricingPlans = [
    {
      plan: 'Hobby Farmer',
      price: '$19',
      features: ['Up to 500 Birds', 'Basic Analytics', 'Community Support'],
    },
    {
      plan: 'Pro Farmer',
      price: '$49',
      features: ['Up to 5000 Birds', 'Advanced Analytics', 'Email & Chat Support', 'Unlimited Users'],
      isPopular: true,
    },
    {
      plan: 'Enterprise',
      price: 'Custom',
      features: ['Unlimited Birds', 'Dedicated Support', 'API Access', 'Custom Integrations'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {showModal && <PaymentModal plan={selectedPlan} onClose={() => setShowModal(false)} />}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
          Find the perfect plan for your farm
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Your free trial has ended. Choose a plan to continue optimizing your farm operations.
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {pricingPlans.map((p) => (
          <PricingTier key={p.plan} {...p} onSelect={() => handleSelectPlan(p.plan)} />
        ))}
      </div>
       {/* FAQ Section */}
      <div className="mt-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Frequently Asked Questions</h2>
        <div className="mt-8 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg">Can I change my plan later?</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Yes, you can upgrade, downgrade, or cancel your plan at any time from your account settings.</p>
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg">What payment methods do you accept?</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">We accept all major credit cards. For Enterprise plans, we also support bank transfers.</p>
            </div>
        </div>
      </div>
    </div>
  );
} 