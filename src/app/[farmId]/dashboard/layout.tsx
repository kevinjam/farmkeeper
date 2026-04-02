'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Settings,
  Bell,
  Menu,
  Plus,
  Sprout,
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

// Navigation items for sidebar with subscription requirements
const getNavigationItems = (t: (key: string) => string) => [
  {
    name: t('navigation.dashboard'),
    href: '/dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    requiredFeatures: [], // Available to all
  },
  {
    name: t('navigation.livestock'),
    href: '/dashboard/livestock',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    requiredFeatures: ['livestock'], // Available to all plans
  },
  {
    name: t('navigation.crops'),
    href: '/dashboard/crops',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M8 16H4M8 8H4M12.5 4.2c.4.2.8.4 1.2.8L16 7.5l3-2.9c.7-.7 1.7-1.1 2.7-.7 1 .4 1.6 1.1 1.8 2.1.2 1-.1 2-.8 2.6L19.5 12l3.2 3.4c.7.7 1 1.7.8 2.6-.2 1-.8 1.8-1.8 2.1-1 .4-2 0-2.7-.7L16 16.5l-2.3 2.5c-.4.4-.8.6-1.2.8" />
      </svg>
    ),
    requiredFeatures: ['crops'], // Available to all plans
  },
  {
    name: t('navigation.finances'),
    href: '/dashboard/finances',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    requiredFeatures: ['finances'], // Premium only
    isPremium: true,
  },
  {
    name: t('navigation.feedManagement'),
    href: '/dashboard/feed',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3zM8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
      </svg>
    ),
    requiredFeatures: ['feed_management'], // Premium only
    isPremium: true,
  },
  {
    name: t('navigation.eggsSales'),
    href: '/dashboard/eggs',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    requiredFeatures: ['eggs_sales'], // Premium only
    isPremium: true,
  },
  {
    name: t('navigation.weather'),
    href: '/dashboard/weather',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    requiredFeatures: ['weather'], // Available to all plans
  },
  {
    name: t('navigation.analytics'),
    href: '/dashboard/analytics',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    requiredFeatures: ['analytics'], // Premium only
    isPremium: true,
  },
  {
    name: t('navigation.subscription'),
    href: '/dashboard/subscription',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    requiredFeatures: [], // Available to all
  },
  {
    name: t('navigation.billing'),
    href: '/dashboard/billing',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    requiredFeatures: ['billing'], // Premium only
    isPremium: true,
  },
  {
    name: t('navigation.settings'),
    href: '/dashboard/settings',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    requiredFeatures: ['settings'], // Available to all plans
  },
];

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { farmId: string };
}) {
  const { farmId } = params;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Assume authenticated until proven otherwise
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    plan: 'free' | 'trial' | 'premium';
    features: string[];
  } | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslations('common');

  const dashboardRootHref = `/${farmId}/dashboard`;
  const isDashboardHome = pathname === dashboardRootHref;

  const mobileNavItems = [
    {
      label: t('navigation.dashboard'),
      shortLabel: 'Home',
      href: dashboardRootHref,
      icon: LayoutDashboard,
      isActive: (p: string) => p === dashboardRootHref,
    },
    {
      label: 'Activities',
      shortLabel: 'Tasks',
      href: `/${farmId}/dashboard/livestock`,
      icon: ClipboardList,
      isActive: (p: string) =>
        p.startsWith(`/${farmId}/dashboard/livestock`) ||
        p.startsWith(`/${farmId}/dashboard/eggs`) ||
        p.startsWith(`/${farmId}/dashboard/crops`) ||
        p.startsWith(`/${farmId}/dashboard/feed`) ||
        p.startsWith(`/${farmId}/dashboard/finances`),
    },
    {
      label: 'Reports',
      shortLabel: 'Reports',
      href: `/${farmId}/dashboard/analytics`,
      icon: BarChart3,
      isActive: (p: string) => p.startsWith(`/${farmId}/dashboard/analytics`),
    },
    {
      label: t('navigation.settings'),
      shortLabel: 'Settings',
      href: `/${farmId}/dashboard/settings`,
      icon: Settings,
      isActive: (p: string) =>
        p.startsWith(`/${farmId}/dashboard/settings`) ||
        p.startsWith(`/${farmId}/dashboard/subscription`) ||
        p.startsWith(`/${farmId}/dashboard/billing`),
    },
  ] as const;

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/billing/trial-status`, {
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSubscriptionStatus({
            plan: data.data.plan,
            features: data.data.features || []
          });
        }
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Process token from URL hash (Google OAuth redirect) before any auth check
        if (typeof window !== 'undefined' && window.location.hash) {
          const params = new URLSearchParams(window.location.hash.slice(1));
          const tokenFromHash = params.get('token');
          if (tokenFromHash) {
            localStorage.setItem('auth-token', tokenFromHash);
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }
        setIsLoading(true);
        console.log('Dashboard: Fetching user authentication status');
        
        // Check if we have a token in localStorage as fallback
        const localToken = localStorage.getItem('auth-token');
        console.log('Dashboard: Local token available:', !!localToken);
        
        // Prepare headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // Add Authorization header as fallback if we have a local token
        if (localToken) {
          headers['Authorization'] = `Bearer ${localToken}`;
          console.log('Dashboard: Using Authorization header with local token');
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/auth/status`, {
          credentials: 'include',
          cache: 'no-store', // Don't cache authentication status
          headers
        });
        
        const data = await response.json();
        console.log('Dashboard: Auth status response:', data);
        console.log('Dashboard: Response status:', response.status);
        console.log('Dashboard: Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok || !data.isAuthenticated) {
          console.log('Dashboard: Auth failed, redirecting to login');
          console.log('Dashboard: Auth failure reason:', data.message || 'Unknown error');
          setIsAuthenticated(false);
          router.replace('/en/auth/login');
          return;
        }
        
        if (!data.isSignedUp) {
          console.log('Dashboard: User not signed up with farm, redirecting to registration');
          router.replace('/en/auth/register');
          return;
        }
        
        // Set farm and user data from API response
        setFarmName(data.farm?.name || farmId.charAt(0).toUpperCase() + farmId.slice(1) + ' Farm');
        setUserName(data.user?.name || 'Farm Owner');
        setIsAuthenticated(true);
        
        // Fetch subscription status after authentication
        await fetchSubscriptionStatus();
      } catch (err) {
        console.error('Dashboard: Error fetching user data:', err);
        setError('Failed to load user data. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [farmId, router]);

  // Check for subscription refresh flag
  useEffect(() => {
    const shouldRefresh = localStorage.getItem('refreshSubscription');
    if (shouldRefresh === 'true') {
      localStorage.removeItem('refreshSubscription');
      fetchSubscriptionStatus();
    }
  }, []);

  // Helper function to check if user has access to a feature
  const hasFeatureAccess = (requiredFeatures: string[]) => {
    if (!subscriptionStatus) return false;
    if (requiredFeatures.length === 0) return true; // No requirements = available to all
    return requiredFeatures.every(feature => subscriptionStatus.features.includes(feature));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-primary-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold">FK</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">FarmKeeper</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-4 py-4">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">FARM</h2>
          <h3 className="text-base font-semibold text-primary-600 truncate">{farmName}</h3>
        </div>
        
        <nav className="px-4 py-2 space-y-1">
          {getNavigationItems(t).map((item) => {
            const fullHref = `/${farmId}${item.href}`;
            const isDashboardRoot = item.href === '/dashboard';
            const isActive = isDashboardRoot
              ? pathname === fullHref
              : (pathname === fullHref || pathname.startsWith(`${fullHref}/`));
            const hasAccess = hasFeatureAccess(item.requiredFeatures);
            const isLocked = !hasAccess && item.requiredFeatures.length > 0;
            
            return (
              <div key={item.name} className="relative">
                {isLocked ? (
                  <div className="flex items-center px-2 py-2 rounded-md text-sm font-medium text-gray-400 dark:text-gray-500 cursor-not-allowed">
                    <div className="mr-3">
                      {item.icon}
                    </div>
                    <span className="flex-1">{item.name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                ) : (
                  <Link
                    href={`/${farmId}${item.href}`}
                    className={`flex items-center px-2 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <div className={`mr-3 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                      {item.icon}
                    </div>
                    {item.name}
                  </Link>
                )}
                
                {/* Upgrade prompt for locked items */}
                {isLocked && (
                  <div className="absolute left-full top-0 ml-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-50 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {item.isPremium ? 'Premium Feature' : 'Upgrade Required'}
                    </div>
                    <div className="text-sm text-gray-800 dark:text-white mb-2">
                      Upgrade to Premium to access {item.name}
                    </div>
                    <Link
                      href={`/${farmId}/dashboard/subscription`}
                      className="inline-flex items-center text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      Upgrade Now
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 w-full border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-4 flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-gray-700 dark:text-gray-200 font-medium">
                {userName ? userName.charAt(0) : 'U'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800 dark:text-white">{userName}</p>
              <Link href="/en/auth/logout" className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </aside>
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Desktop / tablet header — unchanged */}
        <header className="hidden md:block sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700/80">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Open sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="flex-1 text-center lg:text-left text-xl font-semibold text-gray-800 dark:text-white truncate">
              {(
                getNavigationItems(t).find((item) => {
                  const fullHref = `/${farmId}${item.href}`;
                  const isDashboardRoot = item.href === '/dashboard';
                  return isDashboardRoot
                    ? pathname === fullHref
                    : pathname === fullHref || pathname.startsWith(`${fullHref}/`);
                })?.name
              ) || 'Dashboard'}
            </h1>
            <div className="flex items-center space-x-4 shrink-0">
              <button
                type="button"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button
                type="button"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Help"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile app bar — native shell */}
        <header className="md:hidden sticky top-0 z-20 flex items-center gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.2)]">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-700 dark:text-gray-200 active:scale-95 transition-transform"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
              <Sprout className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-gray-900 dark:text-white leading-tight">
                {farmName}
              </p>
              <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">FarmKeeper</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 active:scale-95 transition-transform"
              aria-label="Notifications"
            >
              <Bell className="h-[22px] w-[22px]" />
            </button>
            <Link
              href={`/${farmId}/dashboard/settings/profile`}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 active:scale-95 transition-transform"
              aria-label="Profile"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/50 text-xs font-semibold text-primary-800 dark:text-primary-200">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-md:px-3 max-md:pb-[calc(5.5rem+env(safe-area-inset-bottom))] max-md:pt-3">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-stretch justify-around border-t border-gray-200/90 bg-white/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.18)]"
          aria-label="Primary"
        >
          {mobileNavItems.map((item) => {
            const active = item.isActive(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 active:scale-[0.97] transition-transform ${
                  active
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'stroke-[2.25px]' : ''}`} strokeWidth={active ? 2.25 : 2} />
                <span className="max-w-[4.25rem] truncate text-[10px] font-semibold">{item.shortLabel}</span>
              </Link>
            );
          })}
        </nav>

        {/* FAB — dashboard home only, mobile */}
        {isDashboardHome && (
          <Link
            href={`/${farmId}/dashboard/eggs/record`}
            className="md:hidden fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/35 ring-1 ring-white/20 active:scale-95 transition-transform"
            aria-label="Add record"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </Link>
        )}
      </div>
    </div>
  );
}