'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Building2,
  ChevronRight,
  CreditCard,
  KeyRound,
  Loader2,
  MoreHorizontal,
  Settings,
  User,
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { apiClient } from '@/lib/api';
import { setAuthCookie } from '@/lib/cookies';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const LocationSelector = dynamic(
  () => import('@/components/LocationSelector').then((m) => m.LocationSelector),
  {
    loading: () => <div className="h-28 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />,
    ssr: false,
  }
);

type SettingsTab = 'farm' | 'profile' | 'more';

interface FarmSettings {
  name: string;
  slug: string;
  location: {
    address?: string;
    district?: string;
    country: string;
    coordinates?: { latitude: number; longitude: number };
  };
  settings: {
    currency: string;
    language: string;
    timezone: string;
    notificationsEnabled: boolean;
  };
}

interface UserProfile {
  name: string;
  email: string;
  image?: string | null;
}

const TABS: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { id: 'farm', label: 'Farm', icon: Building2 },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

function FieldSkeleton() {
  return <div className="h-11 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />;
}

function sanitizeFarmSlugInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

function finalizeFarmSlug(value: string): string {
  return sanitizeFarmSlugInput(value).replace(/^-|-$/g, '');
}

export default function SettingsPageContent({ farmSlug }: { farmSlug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { farmPath, locale } = useFarmPaths(farmSlug);
  const { t, raw } = useTranslations('common');

  const initialTab = (searchParams.get('tab') as SettingsTab) || 'farm';
  const [tab, setTab] = useState<SettingsTab>(
    TABS.some((item) => item.id === initialTab) ? initialTab : 'farm'
  );

  const [settings, setSettings] = useState<FarmSettings | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const profileFetched = useRef(false);

  useEffect(() => {
    const requested = searchParams.get('tab') as SettingsTab | null;
    if (requested && TABS.some((item) => item.id === requested)) {
      setTab(requested);
    }
  }, [searchParams]);

  // Farm settings only — do not block on profile/auth (layout already loads user name)
  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setSettingsLoading(true);
      setError('');
      try {
        const settingsRes = await apiClient.getFarmSettings(farmSlug);
        if (cancelled) return;

        if (!settingsRes.success) {
          throw new Error(settingsRes.error || 'Failed to fetch farm settings');
        }
        setSettings(settingsRes.data);
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading settings:', err);
          setError('Failed to load farm settings');
        }
      } finally {
        if (!cancelled) setSettingsLoading(false);
      }
    }

    if (farmSlug) loadSettings();
    return () => {
      cancelled = true;
    };
  }, [farmSlug]);

  // Profile tab loads user details on demand
  useEffect(() => {
    if (tab !== 'profile' || profileFetched.current) return;

    let cancelled = false;
    profileFetched.current = true;

    async function loadProfile() {
      setProfileLoading(true);
      try {
        const statusRes = await apiClient.getAuthStatus();
        if (cancelled) return;
        if (statusRes.success && statusRes.data?.user) {
          const profile = statusRes.data.user as UserProfile & { image?: string | null };
          setUser({
            name: profile.name || '',
            email: profile.email || '',
            image: profile.image,
          });
        }
      } catch (err) {
        if (!cancelled) console.error('Error loading profile:', err);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const handleLocationChange = useCallback((location: FarmSettings['location']) => {
    setSettings((prev) => (prev ? { ...prev, location } : prev));
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;

    const nextSlug = finalizeFarmSlug(settings.slug);
    if (nextSlug.length < 3) {
      setError(t('settings.farmUrlInvalid'));
      setSuccess('');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const response = await apiClient.updateFarmSettings(farmSlug, {
        name: settings.name,
        slug: nextSlug,
        location: settings.location,
        settings: settings.settings,
      });

      if (!response.success) {
        throw new Error(response.error || t('settings.settingsError'));
      }

      const saved = response.data as FarmSettings & { token?: string; slugChanged?: boolean };
      if (saved?.token) {
        apiClient.setToken(saved.token);
        setAuthCookie(saved.token);
      }
      if (saved?.slug) {
        localStorage.setItem('farmSlug', saved.slug);
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                name: saved.name ?? prev.name,
                slug: saved.slug,
                location: saved.location ?? prev.location,
                settings: saved.settings ?? prev.settings,
              }
            : prev
        );
      }

      if (saved?.slugChanged && saved.slug && saved.slug !== farmSlug) {
        router.replace(`/${locale}/${saved.slug}/dashboard/settings`);
        return;
      }

      setSuccess(t('settings.settingsUpdated'));
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error && err.message ? err.message : t('settings.settingsError'));
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white [font-size:16px] max-md:min-h-11';

  const settingsReady = Boolean(settings);
  const showSettingsError = !settingsLoading && !settingsReady && error;

  return (
    <div className="-mx-3 flex min-h-[calc(100dvh-5.5rem)] flex-col overflow-hidden rounded-none border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/80 dark:bg-gray-900 sm:-mx-6 lg:-mx-8 max-md:mb-0 max-md:min-h-[calc(100dvh-8rem)] max-md:pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:min-h-[calc(100dvh-4.5rem)] md:rounded-xl">
      {/* Header — full width */}
      <div className="shrink-0 border-b border-gray-200 bg-gradient-to-r from-slate-50 via-white to-white px-4 py-4 dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/95 sm:px-6 md:px-8 md:py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-500/15 text-slate-800 dark:bg-slate-500/20 dark:text-slate-200 md:h-12 md:w-12">
            <Settings className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
              {t('navigation.settings')}
            </h1>
            <p className="mt-0.5 text-[13px] text-gray-600 dark:text-gray-400 md:text-sm">{t('settings.subtitle')}</p>
          </div>
        </div>

        {(error || success) && (
          <div
            className={`mt-3 rounded-xl px-4 py-3 text-sm ${
              error
                ? 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
                : 'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300'
            }`}
          >
            {error || success}
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Tabs — horizontal on mobile, vertical sidebar on desktop */}
        <div className="shrink-0 border-b border-gray-200 bg-gray-50/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/60 md:w-56 md:border-b-0 md:border-r lg:w-64">
          <nav
            className="flex gap-1 overflow-x-auto p-2 scrollbar-hide md:flex-col md:gap-0.5 md:p-3"
            aria-label="Settings sections"
          >
            {TABS.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`inline-flex w-full shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition md:py-3 ${
                    active
                      ? 'bg-primary-600 text-white shadow-sm md:bg-primary-600/10 md:text-primary-700 md:shadow-none dark:md:bg-primary-500/15 dark:md:text-primary-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/80'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content — grows to fill remaining space */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white dark:bg-gray-900/40">
          <div className="flex w-full flex-1 flex-col p-4 sm:p-6 md:p-8">
        {/* Farm */}
        {tab === 'farm' && (
          <div className="flex flex-1 flex-col space-y-4 md:space-y-6">
            {showSettingsError ? (
              <p className="text-sm font-medium text-red-600 dark:text-red-300">{error}</p>
            ) : settingsLoading || !settings ? (
              <div className="space-y-4">
                <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                  <FieldSkeleton />
                  <FieldSkeleton />
                </div>
                <div className="h-28 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
              </div>
            ) : (
              <>
                <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('settings.farmName')}
                    </label>
                    <input
                      type="text"
                      value={settings.name}
                      onChange={(e) => setSettings((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                      className={inputClass}
                      placeholder={t('settings.farmNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('settings.farmUrl')}
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="shrink-0 text-sm text-gray-500">farmkeeper.app/</span>
                      <input
                        type="text"
                        value={settings.slug}
                        onChange={(e) =>
                          setSettings((prev) =>
                            prev ? { ...prev, slug: sanitizeFarmSlugInput(e.target.value) } : prev
                          )
                        }
                        className={`min-w-0 flex-1 ${inputClass}`}
                        placeholder="your-farm"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      {t('settings.farmUrlHint')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('settings.locationSettings')}</p>
                  <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{t('settings.locationDescription')}</p>
                  <LocationSelector
                    initialLocation={settings.location}
                    onLocationChange={handleLocationChange}
                    required={false}
                  />
                  <details className="mt-3 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40">
                    <summary className="cursor-pointer px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('settings.locationTroubleshooting')}
                    </summary>
                    <div className="space-y-2 border-t border-gray-200 px-3 py-3 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-400">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{t('settings.locationTroubleshootingTitle')}</p>
                      <ul className="ml-4 list-disc space-y-1">
                        {(raw('settings.locationTroubleshootingTips') as string[] || []).map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </details>
                </div>

                <SaveBar isSaving={isSaving} onSave={handleSaveSettings} label={t('settings.saveSettings')} savingLabel={t('settings.saving')} />
              </>
            )}
          </div>
        )}

        {/* Profile */}
        {tab === 'profile' && (
          <div className="flex flex-1 flex-col space-y-4 md:space-y-5">
            {profileLoading && !user ? (
              <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="h-14 w-14 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-40 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-4 w-56 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <Avatar className="h-14 w-14 border-2 border-gray-200 dark:border-gray-700">
                    <AvatarImage src={user?.image || undefined} alt={user?.name} />
                    <AvatarFallback className="bg-primary-100 text-lg text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                      {user?.name?.slice(0, 2).toUpperCase() || 'FK'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-semibold text-gray-900 dark:text-white">{user?.name || '—'}</p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user?.email || '—'}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700 md:p-5">
                  <div className="flex items-start gap-3">
                    <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Password</p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Sign out and use &ldquo;Forgot password&rdquo; on the login page to reset your password.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href={farmPath('/dashboard/billing')}
                  className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/60 md:p-5"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Plan &amp; billing</p>
                      <p className="text-sm text-gray-500">Manage subscription and payments</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* More */}
        {tab === 'more' && (
          <div className="flex flex-1 flex-col space-y-4 md:space-y-6">
            {settingsLoading || !settings ? (
              <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                <FieldSkeleton />
                <FieldSkeleton />
                <FieldSkeleton />
                <FieldSkeleton />
              </div>
            ) : (
            <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.currency')}
                </label>
                <select
                  value={settings.settings.currency}
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev ? { ...prev, settings: { ...prev.settings, currency: e.target.value } } : prev
                    )
                  }
                  className={inputClass}
                >
                  <option value="UGX">{t('currencies.UGX')}</option>
                  <option value="USD">{t('currencies.USD')}</option>
                  <option value="EUR">{t('currencies.EUR')}</option>
                </select>
              </div>

              <LanguageSelector />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.timezone')}
                </label>
                <select
                  value={settings.settings.timezone}
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev ? { ...prev, settings: { ...prev.settings, timezone: e.target.value } } : prev
                    )
                  }
                  className={inputClass}
                >
                  <option value="Africa/Kampala">{t('timezones.Africa/Kampala')}</option>
                  <option value="Africa/Nairobi">{t('timezones.Africa/Nairobi')}</option>
                  <option value="Africa/Dar_es_Salaam">{t('timezones.Africa/Dar_es_Salaam')}</option>
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-3 py-3 dark:border-gray-700 sm:mt-7">
                <input
                  type="checkbox"
                  checked={settings.settings.notificationsEnabled}
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev
                        ? { ...prev, settings: { ...prev.settings, notificationsEnabled: e.target.checked } }
                        : prev
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('settings.notificationsEnabled')}</span>
              </label>
            </div>
            )}

            {settings && (
              <SaveBar isSaving={isSaving} onSave={handleSaveSettings} label={t('settings.saveSettings')} savingLabel={t('settings.saving')} />
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveBar({
  isSaving,
  onSave,
  label,
  savingLabel,
}: {
  isSaving: boolean;
  onSave: () => void;
  label: string;
  savingLabel: string;
}) {
  return (
    <div className="mt-auto flex justify-end border-t border-gray-100 pt-5 dark:border-gray-800 md:pt-6">
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {savingLabel}
          </>
        ) : (
          label
        )}
      </button>
    </div>
  );
}
