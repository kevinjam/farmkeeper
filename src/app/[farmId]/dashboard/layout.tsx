'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useParams, useRouter } from 'next/navigation';
import {
  buildFarmPath,
  getLocaleFromPathname,
  stripLocaleFromPathname,
} from '@/lib/farmPaths';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Settings,
  Menu,
  Sprout,
  Wheat,
  Lock,
  Crown,
  LogOut,
  UserRound,
  CircleHelp,
  Search,
  BookOpen,
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { apiClient } from '@/lib/api';
import { getCountryByCode, normalizeCountryCode } from '@/lib/countries';
import { hasFeatureAccess, canAccessDashboardPath, getGatedFeatureForDashboardPath, BASELINE_FEATURES } from '@/lib/features';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import FeatureGate from '@/components/billing/FeatureGate';
import QuickAddFab from '@/components/dashboard/QuickAddFab';
import { PresenceHeartbeat } from '@/components/presence-heartbeat';
import { normalizePlanId, PlanId } from '@/lib/billing';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type NavItem = {
  name: string;
  href: string;
  icon: ReactNode;
  requiredFeatures: string[];
};

type NavSection = {
  id: string;
  label?: string;
  pin?: 'bottom';
  items: NavItem[];
};

/** Sidebar grouped by farm work, not by app modules. */
const getNavigationSections = (t: (key: string) => string): NavSection[] => [
  {
    id: 'home',
    items: [
      {
        name: t('navigation.dashboard'),
        href: '/dashboard',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
        requiredFeatures: [],
      },
    ],
  },
  {
    id: 'animals',
    label: t('navigation.sectionAnimals'),
    items: [
      {
        name: t('navigation.livestock'),
        href: '/dashboard/livestock',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ),
        requiredFeatures: ['livestock'],
      },
      {
        name: t('navigation.feedManagement'),
        href: '/dashboard/feed',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3zM8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
          </svg>
        ),
        requiredFeatures: ['feed_management'],
      },
      {
        name: t('navigation.eggsSales'),
        href: '/dashboard/eggs',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        ),
        requiredFeatures: ['eggs_sales'],
      },
    ],
  },
  {
    id: 'crops',
    label: t('navigation.sectionCrops'),
    items: [
      {
        name: t('navigation.crops'),
        href: '/dashboard/crops',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M8 16H4M8 8H4M12.5 4.2c.4.2.8.4 1.2.8L16 7.5l3-2.9c.7-.7 1.7-1.1 2.7-.7 1 .4 1.6 1.1 1.8 2.1.2 1-.1 2-.8 2.6L19.5 12l3.2 3.4c.7.7 1 1.7.8 2.6-.2 1-.8 1.8-1.8 2.1-1 .4-2 0-2.7-.7L16 16.5l-2.3 2.5c-.4.4-.8.6-1.2.8" />
          </svg>
        ),
        requiredFeatures: ['crops'],
      },
      {
        name: t('navigation.harvests'),
        href: '/dashboard/harvests',
        icon: <Wheat className="h-6 w-6" />,
        requiredFeatures: ['crops'],
      },
    ],
  },
  {
    id: 'work',
    label: t('navigation.sectionWork'),
    items: [
      {
        name: t('navigation.tasks'),
        href: '/dashboard/tasks',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
        requiredFeatures: [],
      },
      {
        name: t('navigation.weather'),
        href: '/dashboard/weather',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        ),
        requiredFeatures: ['weather'],
      },
    ],
  },
  {
    id: 'money',
    label: t('navigation.sectionMoney'),
    items: [
      {
        name: t('navigation.finances'),
        href: '/dashboard/finances',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        requiredFeatures: ['finances'],
      },
      {
        name: t('navigation.profitability'),
        href: '/dashboard/profitability',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        ),
        requiredFeatures: ['finances'],
      },
      {
        name: t('navigation.analytics'),
        href: '/dashboard/analytics',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        requiredFeatures: ['analytics'],
      },
    ],
  },
  {
    id: 'account',
    label: t('navigation.sectionAccount'),
    pin: 'bottom',
    items: [
      {
        name: t('navigation.helpSupport'),
        href: '/dashboard/help',
        icon: <CircleHelp className="h-6 w-6" />,
        requiredFeatures: [],
      },
      {
        name: t('navigation.planBilling'),
        href: '/dashboard/billing',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        ),
        requiredFeatures: [],
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
        requiredFeatures: ['settings'],
      },
    ],
  },
];

function ProfileAvatar({
  name,
  image,
  size = 'md',
}: {
  name: string;
  image?: string;
  size?: 'sm' | 'md';
}) {
  const dim = size === 'sm' ? 'h-9 w-9 text-xs' : 'h-10 w-10 text-sm';
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className={`${dim} rounded-full object-cover`}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <span
      className={`flex ${dim} items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-800 dark:bg-primary-900/60 dark:text-primary-200`}
    >
      {name ? name.charAt(0).toUpperCase() : 'U'}
    </span>
  );
}

function HelpHeaderMenu({
  helpHref,
  label,
}: {
  helpHref: string;
  label: string;
}) {
  const pathname = usePathname();
  const itemClass =
    'cursor-pointer rounded-lg px-3 py-2.5 focus:bg-gray-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:focus:bg-gray-800';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-haspopup="menu"
          title={label}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        >
          <CircleHelp className="h-5 w-5" aria-hidden />
          <span className="sr-only">{label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        aria-labelledby="help-menu-heading"
        className="w-64 rounded-xl border border-gray-200 bg-white p-0 shadow-lg dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <p id="help-menu-heading" className="text-sm font-semibold text-gray-900 dark:text-white">
            How can we help?
          </p>
        </div>
        <div className="p-1.5" role="none">
          <DropdownMenuItem asChild className={itemClass}>
            <Link href={`${helpHref}?section=search`} className="flex items-center gap-2.5">
              <Search className="h-4 w-4 text-gray-500" aria-hidden />
              <span>Search Help</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={itemClass}>
            <Link href={`${helpHref}?section=support&from=${encodeURIComponent(pathname)}`} className="flex items-center gap-2.5">
              <CircleHelp className="h-4 w-4 text-gray-500" aria-hidden />
              <span>Get Support</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={itemClass}>
            <Link href={`${helpHref}?section=learn`} className="flex items-center gap-2.5">
              <BookOpen className="h-4 w-4 text-gray-500" aria-hidden />
              <span>Learn FarmKeeper</span>
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserProfileMenu({
  name,
  email,
  image,
  profileHref,
  helpHref,
  helpLabel,
  size = 'md',
}: {
  name: string;
  email: string;
  image?: string;
  profileHref: string;
  helpHref: string;
  helpLabel: string;
  size?: 'sm' | 'md';
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-primary-500/30 transition hover:ring-primary-500/60 focus:outline-none focus-visible:ring-primary-500 dark:ring-primary-400/40 ${
            size === 'sm' ? 'h-9 w-9' : 'h-10 w-10'
          }`}
          aria-label="Account menu"
        >
          <ProfileAvatar name={name} image={image} size={size} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 rounded-xl border border-gray-200 bg-white p-0 shadow-lg dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="flex items-start gap-3 border-b border-gray-100 px-4 py-3.5 dark:border-gray-800">
          <div className="mt-0.5 overflow-hidden rounded-full ring-2 ring-primary-500/20">
            <ProfileAvatar name={name} image={image} size="md" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {name || 'Farm owner'}
            </p>
            <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400" title={email}>
              {email || 'No email on file'}
            </p>
          </div>
        </div>
        <div className="p-1.5">
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2.5">
            <Link href={profileHref} className="flex items-center gap-2.5">
              <UserRound className="h-4 w-4 text-gray-500" />
              <span>Profile settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2.5">
            <Link href={helpHref} className="flex items-center gap-2.5">
              <CircleHelp className="h-4 w-4 text-gray-500" />
              <span>{helpLabel}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-800" />
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2.5 text-red-600 focus:text-red-600 dark:text-red-400">
            <Link href="/en/auth/logout" className="flex items-center gap-2.5">
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { farmId: string };
}) {
  const routeParams = useParams();
  const farmId = (routeParams?.farmId as string) || params.farmId;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('userEmail') || '';
  });
  const [userImage, setUserImage] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmCountryCode, setFarmCountryCode] = useState('UG');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Assume authenticated until proven otherwise
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    plan: PlanId;
    features: string[];
    livestockLimit: number | null;
    unlockAllFeatures: boolean;
    daysLeft: number;
    isTrialExpired: boolean;
    isFarmerTrial: boolean;
  } | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslations('common');
  const locale = getLocaleFromPathname(pathname);
  const pathnameWithoutLocale = stripLocaleFromPathname(pathname);

  const dashboardRootHref = buildFarmPath(farmId, '/dashboard', locale);
  const isDashboardHome =
    pathnameWithoutLocale === `/${farmId}/dashboard` ||
    pathnameWithoutLocale === `/${farmId}/dashboard/`;
  const isHelpRoute = pathnameWithoutLocale.includes(`/${farmId}/dashboard/help`);
  const isBillingRoute = pathnameWithoutLocale.includes(`/${farmId}/dashboard/billing`);
  const isFillRoute = isHelpRoute || isBillingRoute;

  const features = subscriptionStatus?.features ?? [];
  const unlockAll = subscriptionStatus?.unlockAllFeatures ?? false;
  // Show every module; locked ones stay visible with a soft lock (upsell path).
  const navSections = getNavigationSections(t);
  const navItems = navSections.flatMap((section) => section.items);
  const gatedFeature = subscriptionStatus
    ? getGatedFeatureForDashboardPath(pathnameWithoutLocale, farmId)
    : null;
  const routeBlocked = Boolean(
    subscriptionStatus &&
      gatedFeature &&
      !canAccessDashboardPath(pathnameWithoutLocale, farmId, features, unlockAll)
  );
  const analyticsLocked = !hasFeatureAccess(features, 'analytics', unlockAll);
  const showUnlockPremium =
    subscriptionStatus !== null &&
    subscriptionStatus.plan !== 'premium' &&
    !unlockAll;
  const isUgandaFarm = getCountryByCode(farmCountryCode).paymentRegion === 'uganda';
  const farmerStartPrice = isUgandaFarm ? 'UGX 3,500' : '$2';
  const profileHref = `${buildFarmPath(farmId, '/dashboard/settings', locale)}?tab=profile`;
  const helpHref = buildFarmPath(farmId, '/dashboard/help', locale);
  const helpLabel = t('navigation.helpSupport');
  const billingPlansHref = `${buildFarmPath(farmId, '/dashboard/billing', locale)}?tab=plans`;

  const mobileNavItems = [
    {
      label: t('navigation.dashboard'),
      shortLabel: 'Home',
      href: dashboardRootHref,
      icon: LayoutDashboard,
      isActive: (p: string) => p === dashboardRootHref,
    },
    {
      label: t('navigation.tasks'),
      shortLabel: 'Tasks',
      href: buildFarmPath(farmId, '/dashboard/tasks', locale),
      icon: ClipboardList,
      isActive: (p: string) =>
        p.startsWith(buildFarmPath(farmId, '/dashboard/tasks', locale)),
    },
    {
      label: 'Reports',
      shortLabel: 'Reports',
      href: buildFarmPath(farmId, '/dashboard/analytics', locale),
      icon: BarChart3,
      isActive: (p: string) => p.startsWith(buildFarmPath(farmId, '/dashboard/analytics', locale)),
    },
    {
      label: t('navigation.settings'),
      shortLabel: 'Settings',
      href: buildFarmPath(farmId, '/dashboard/settings', locale),
      icon: Settings,
      isActive: (p: string) =>
        p.startsWith(buildFarmPath(farmId, '/dashboard/settings', locale)) ||
        p.startsWith(buildFarmPath(farmId, '/dashboard/subscription', locale)) ||
        p.startsWith(buildFarmPath(farmId, '/dashboard/billing', locale)),
    },
  ] as const;

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await apiClient.getSubscriptionStatus();
      if (response.success && response.data) {
        const data = response.data;
        setSubscriptionStatus({
          plan: normalizePlanId(data.rawPlan || data.plan || 'free'),
          features: Array.from(new Set([...(data.features || []), ...BASELINE_FEATURES])),
          livestockLimit: data.livestockLimit ?? null,
          unlockAllFeatures: Boolean(data.unlockAllFeatures),
          daysLeft: data.daysLeft ?? 0,
          isTrialExpired: Boolean(
            data.isTrialExpired ?? (data.isFarmerTrial && data.isExpired)
          ),
          isFarmerTrial: Boolean(data.isFarmerTrial),
        });
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

        if (typeof data.token === 'string' && data.token) {
          apiClient.setToken(data.token);
        }

        if (data.farm?.slug && data.farm.slug !== farmId) {
          const locale = getLocaleFromPathname(pathname) || 'en';
          const rest = stripLocaleFromPathname(pathname).replace(/^\/[^/]+/, '') || '/dashboard';
          router.replace(buildFarmPath(data.farm.slug, rest, locale));
          return;
        }
        
        // Set farm and user data from API response
        setFarmName(data.farm?.name || farmId.charAt(0).toUpperCase() + farmId.slice(1) + ' Farm');
        setFarmCountryCode(normalizeCountryCode(data.farm?.location?.country));
        setUserName(data.user?.name || 'Farm Owner');
        const resolvedEmail =
          (typeof data.user?.email === 'string' && data.user.email.trim()) ||
          localStorage.getItem('userEmail') ||
          '';
        setUserEmail(resolvedEmail);
        if (resolvedEmail) {
          localStorage.setItem('userEmail', resolvedEmail);
        }
        setUserImage(typeof data.user?.image === 'string' ? data.user.image : '');
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

  const subscriptionContextValue = {
    plan: subscriptionStatus?.plan ?? ('free' as PlanId),
    features,
    unlockAllFeatures: unlockAll,
    livestockLimit: subscriptionStatus?.livestockLimit ?? null,
    daysLeft: subscriptionStatus?.daysLeft ?? 0,
    isFarmerTrial: subscriptionStatus?.isFarmerTrial ?? false,
    isTrialExpired: subscriptionStatus?.isTrialExpired ?? false,
    loaded: subscriptionStatus !== null,
  };

  const visibleMobileNavItems = mobileNavItems;
  const mainSections = navSections.filter((section) => section.pin !== 'bottom');
  const accountSection = navSections.find((section) => section.pin === 'bottom');

  const renderSidebarLink = (item: NavItem, compact = false) => {
    const fullHref = buildFarmPath(farmId, item.href, locale);
    const farmPath = `/${farmId}${item.href}`;
    const isDashboardRoot = item.href === '/dashboard';
    const isActive = isDashboardRoot
      ? pathnameWithoutLocale === farmPath
      : pathnameWithoutLocale === farmPath ||
        pathnameWithoutLocale.startsWith(`${farmPath}/`);
    const isLocked =
      subscriptionStatus !== null &&
      !hasFeatureAccess(features, item.requiredFeatures, unlockAll);
    return (
      <Link
        key={item.href}
        href={fullHref}
        className={`flex items-center rounded-md text-sm font-medium ${
          compact ? 'px-2 py-1.5' : 'min-h-11 px-2 py-2 lg:min-h-0'
        } ${
          isLocked
            ? isActive
              ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
              : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/60'
            : isActive
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-current={isActive ? 'page' : undefined}
        aria-disabled={isLocked || undefined}
        title={isLocked ? 'Included on a higher plan — tap to upgrade' : undefined}
        onClick={() => setIsSidebarOpen(false)}
      >
        <div
          className={`mr-3 [&_svg]:h-5 [&_svg]:w-5 ${
            isLocked
              ? 'text-gray-400 dark:text-gray-500'
              : isActive
                ? 'text-primary-600 dark:text-primary-400'
                : ''
          }`}
        >
          {item.icon}
        </div>
        <span className="flex-1 truncate">{item.name}</span>
        {isLocked ? (
          <Lock className="ml-2 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        ) : null}
      </Link>
    );
  };

  return (
    <SubscriptionProvider value={subscriptionContextValue}>
    <PresenceHeartbeat />
    <div className={`${isFillRoute ? 'h-dvh overflow-hidden' : 'min-h-screen'} bg-gray-50 dark:bg-gray-900`}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-gray-800 shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3.5 dark:border-gray-700">
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

        <div className="shrink-0 px-4 py-2">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">FARM</h2>
          <h3 className="text-base font-semibold text-primary-600 truncate">{farmName}</h3>
        </div>

        <nav
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-2 scrollbar-hide"
          aria-label="Farm"
        >
          {mainSections.map((section) => (
            <div key={section.id} className={section.label ? 'mt-3.5' : ''}>
              {section.label ? (
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {section.label}
                </p>
              ) : null}
              <div className="space-y-1">{section.items.map((item) => renderSidebarLink(item))}</div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-gray-200 dark:border-gray-700">
          {accountSection ? (
            <div className="px-3 pt-3">
              {accountSection.label ? (
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {accountSection.label}
                </p>
              ) : null}
              <div className="space-y-1">
                {accountSection.items.map((item) => renderSidebarLink(item))}
              </div>
            </div>
          ) : null}
          <div className="px-4 py-3 flex items-center">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center ring-1 ring-primary-500/20">
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userImage} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  {userName ? userName.charAt(0) : 'U'}
                </span>
              )}
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{userName}</p>
              {userEmail ? (
                <p className="truncate text-[11px] text-gray-500 dark:text-gray-400" title={userEmail}>
                  {userEmail}
                </p>
              ) : null}
              {subscriptionStatus && (
                <p className="text-[11px] font-medium text-primary-700 dark:text-primary-300 truncate">
                  {subscriptionStatus.isFarmerTrial
                    ? `Farmer trial · ${subscriptionStatus.daysLeft}d left`
                    : subscriptionStatus.plan === 'free'
                      ? 'Free plan'
                      : subscriptionStatus.plan === 'premium'
                        ? 'Premium'
                        : 'Farmer'}
                </p>
              )}
              <Link href="/en/auth/logout" className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </aside>
      
      <div className={`lg:pl-64 flex flex-col ${isFillRoute ? 'h-full overflow-hidden' : 'min-h-screen'}`}>
        {/* Desktop / tablet header — unchanged */}
        <header className="hidden md:block sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700/80">
          <div className="px-3 sm:px-4 lg:px-5 py-4 flex justify-between items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Open sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="flex-1 text-center lg:text-left text-xl font-semibold text-gray-800 dark:text-white truncate">
              {(
                navItems.find((item) => {
                  const isDashboardRoot = item.href === '/dashboard';
                  const farmPath = `/${farmId}${item.href}`;
                  return isDashboardRoot
                    ? pathnameWithoutLocale === farmPath
                    : pathnameWithoutLocale === farmPath ||
                        pathnameWithoutLocale.startsWith(`${farmPath}/`);
                })?.name
              ) || 'Dashboard'}
            </h1>
            <div className="flex shrink-0 items-center gap-2">
              {showUnlockPremium && (
                <Link
                  href={billingPlansHref}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 ring-1 ring-amber-200/80 transition-colors hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800/60 dark:hover:bg-amber-950/70"
                >
                  <Crown className="h-4 w-4" aria-hidden />
                  Unlock Premium
                </Link>
              )}
              <HelpHeaderMenu helpHref={helpHref} label={helpLabel} />
              <UserProfileMenu
                name={userName}
                email={userEmail}
                image={userImage}
                profileHref={profileHref}
                helpHref={helpHref}
                helpLabel={helpLabel}
                size="md"
              />
            </div>
          </div>
        </header>

        {/* Mobile app bar — native shell */}
        <header className="md:hidden sticky top-0 z-20 flex items-center gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.2)]">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-700 dark:text-gray-200 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
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
          <div className="flex shrink-0 items-center gap-1.5">
            {showUnlockPremium && (
              <Link
                href={billingPlansHref}
                className="inline-flex max-w-[7.5rem] items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-2 text-[11px] font-semibold leading-tight text-amber-800 ring-1 ring-amber-200/80 active:scale-95 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-800/50"
              >
                <Crown className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">Unlock Premium</span>
              </Link>
            )}
            <UserProfileMenu
              name={userName}
              email={userEmail}
              image={userImage}
              profileHref={profileHref}
              helpHref={helpHref}
              helpLabel={helpLabel}
              size="sm"
            />
          </div>
        </header>

        {subscriptionStatus &&
          subscriptionStatus.isFarmerTrial &&
          (subscriptionStatus.isTrialExpired || subscriptionStatus.daysLeft <= 7) && (
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/40 md:px-8">
              <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  {subscriptionStatus.isTrialExpired
                    ? 'Your free Farmer trial has ended.'
                    : `Farmer free trial: ${subscriptionStatus.daysLeft} day${subscriptionStatus.daysLeft === 1 ? '' : 's'} left.`}
                  {' '}Subscribe from {farmerStartPrice}/mo to keep your tools.
                </p>
                <Link
                  href={buildFarmPath(farmId, '/dashboard/billing', locale)}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-amber-600 px-4 text-sm font-semibold text-white active:scale-[0.98]"
                >
                  View plans
                </Link>
              </div>
            </div>
          )}

        <main
          className={
            isFillRoute
              ? 'flex min-h-0 flex-1 flex-col overflow-hidden p-3 max-md:overflow-y-auto max-md:pb-[calc(5.5rem+env(safe-area-inset-bottom))]'
              : 'flex-1 px-3 py-3 sm:px-4 sm:py-6 lg:px-5 lg:py-8 max-md:pb-[calc(5.5rem+env(safe-area-inset-bottom))]'
          }
        >
          {gatedFeature && !subscriptionStatus ? (
            <div className="flex items-center justify-center py-24 text-gray-500 dark:text-gray-400">
              Loading…
            </div>
          ) : routeBlocked && gatedFeature && subscriptionStatus ? (
            <FeatureGate
              farmId={farmId}
              feature={gatedFeature}
              subscription={{
                plan: subscriptionStatus.plan,
                isFarmerTrial: subscriptionStatus.isFarmerTrial,
                isTrialExpired: subscriptionStatus.isTrialExpired,
              }}
            />
          ) : (
            children
          )}
        </main>

        {/* Mobile bottom navigation */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-stretch justify-around border-t border-gray-200/90 bg-white/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.18)]"
          aria-label="Primary"
        >
          {visibleMobileNavItems.map((item) => {
            const active = item.isActive(pathname);
            const Icon = item.icon;
            const locked = item.shortLabel === 'Reports' && analyticsLocked;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`relative flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 active:scale-[0.97] transition-transform ${
                  locked
                    ? 'text-gray-400 dark:text-gray-500'
                    : active
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                }`}
                title={locked ? 'Premium — tap to upgrade' : undefined}
              >
                <Icon className={`h-5 w-5 ${active && !locked ? 'stroke-[2.25px]' : ''}`} strokeWidth={active && !locked ? 2.25 : 2} />
                <span className="max-w-[4.25rem] truncate text-[10px] font-semibold">{item.shortLabel}</span>
                {locked && (
                  <Lock className="absolute right-2 top-1 h-2.5 w-2.5 text-amber-600 dark:text-amber-400" aria-hidden />
                )}
              </Link>
            );
          })}
        </nav>

        {/* FAB — dashboard home, mobile */}
        {isDashboardHome ? (
          <QuickAddFab farmId={farmId} locale={locale} features={features} unlockAll={unlockAll} />
        ) : null}
      </div>
    </div>
    </SubscriptionProvider>
  );
}