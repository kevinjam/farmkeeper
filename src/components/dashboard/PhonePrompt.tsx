'use client';

import { useEffect, useState } from 'react';
import { Loader2, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PhoneNumberInput, phoneForSubmit, toPhoneIso2 } from '@/components/ui/phone-input';
import { apiClient } from '@/lib/api';

const DISMISS_KEY = 'phone-prompt-dismissed';

function dismissKey(userId: string) {
  return `${DISMISS_KEY}:${userId}`;
}

interface PhonePromptProps {
  farmId: string;
}

export default function PhonePrompt({ farmId }: PhonePromptProps) {
  const [visible, setVisible] = useState(false);
  const [userId, setUserId] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('UG');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const statusRes = await apiClient.getAuthStatus();
        if (cancelled || !statusRes.success) return;

        const user = statusRes.data?.user;
        const id = user?.id ? String(user.id) : '';
        if (user?.phone?.trim()) return;
        if (id && typeof window !== 'undefined' && localStorage.getItem(dismissKey(id)) === '1') {
          return;
        }

        let nextCountry = 'UG';
        try {
          const settingsRes = await apiClient.getFarmSettings(farmId);
          const country = (settingsRes.data as { location?: { country?: string } })?.location?.country;
          nextCountry = toPhoneIso2(country).toUpperCase();
        } catch {
          // Keep Uganda default
        }

        if (cancelled) return;
        setUserId(id);
        setCountryCode(nextCountry);
        setVisible(true);
      } catch {
        // Fail quiet — don't block the dashboard
      }
    };

    if (farmId) check();
    return () => {
      cancelled = true;
    };
  }, [farmId]);

  const dismiss = () => {
    if (typeof window !== 'undefined' && userId) {
      localStorage.setItem(dismissKey(userId), '1');
    }
    setVisible(false);
  };

  const handleSave = async () => {
    const nextPhone = phoneForSubmit(phone);
    if (!nextPhone) {
      setError('Enter your WhatsApp number, or skip for now.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const response = await apiClient.updateProfile({
        phone: nextPhone,
        countryCode,
      });
      if (!response.success) {
        throw new Error(response.error || 'Could not save number');
      }
      if (typeof window !== 'undefined' && userId) {
        localStorage.removeItem(dismissKey(userId));
      }
      setSuccessMessage('Thanks — we’ll use this if you need help.');
      setTimeout(() => setVisible(false), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save number');
    } finally {
      setIsSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="overflow-visible rounded-lg border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-white shadow-md dark:border-emerald-900/50 dark:from-emerald-950/40 dark:via-gray-900 dark:to-gray-900 max-md:rounded-2xl">
      <div className="relative px-4 py-5 sm:px-5 sm:py-6">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
              Add your WhatsApp number
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Optional — so we can help you faster if you ever get stuck.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            {successMessage}
          </div>
        )}

        <div className="mt-5 space-y-3">
          <PhoneNumberInput
            id="dashboard-whatsapp"
            defaultCountry={countryCode}
            value={phone}
            onChange={(next, country) => {
              setPhone(next);
              setCountryCode(country.iso2.toUpperCase());
            }}
          />
          <Button
            type="button"
            className="h-12 w-full gap-2 rounded-xl text-base font-semibold"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save number'
            )}
          </Button>
          <button
            type="button"
            onClick={dismiss}
            className="block w-full pt-1 text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Ask me later
          </button>
        </div>
      </div>
    </div>
  );
}
