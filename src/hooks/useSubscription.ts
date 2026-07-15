'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { normalizeCountryCode } from '@/lib/countries';
import {
  BillingMeta,
  normalizeSubscriptionStatus,
  PaymentRecord,
  Plans,
  SubscriptionStatus,
} from '@/lib/billing';

function splitPlansResponse(data: Record<string, unknown>) {
  const { meta, ...rest } = data;
  const plans: Plans = {
    free: rest.free as Plans['free'],
    farmer: rest.farmer as Plans['farmer'],
    premium: rest.premium as Plans['premium'],
  };
  return {
    plans,
    meta: meta as BillingMeta | undefined,
  };
}

export function useSubscription(farmCountry?: string) {
  const countryCode = farmCountry ? normalizeCountryCode(farmCountry) : '';
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [plans, setPlans] = useState<Plans | null>(null);
  const [billingMeta, setBillingMeta] = useState<BillingMeta | null>(null);
  const [history, setHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStatus = useCallback(async () => {
    const response = await apiClient.getSubscriptionStatus();
    if (!response.success) {
      throw new Error(response.error || 'Failed to load subscription status');
    }
    setStatus(normalizeSubscriptionStatus(response.data));
    return normalizeSubscriptionStatus(response.data);
  }, []);

  const fetchPlans = useCallback(async (country?: string) => {
    const code = country || countryCode;
    if (!code) return null;
    const response = await apiClient.getPlans(code);
    if (!response.success) {
      throw new Error(response.error || 'Failed to load plans');
    }
    const { plans: nextPlans, meta } = splitPlansResponse(response.data as Record<string, unknown>);
    setPlans(nextPlans);
    if (meta) setBillingMeta(meta);
    return nextPlans;
  }, [countryCode]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await apiClient.getSubscriptionHistory();
      if (response.success) {
        setHistory(response.data || []);
      }
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setError('');
    try {
      await Promise.all([fetchStatus(), fetchPlans(countryCode || undefined)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing data');
    }
  }, [countryCode, fetchPlans, fetchStatus]);

  const refreshAll = useCallback(async () => {
    await refresh();
    await fetchHistory();
  }, [fetchHistory, refresh]);

  const cancelSubscription = useCallback(async () => {
    const response = await apiClient.cancelSubscription();
    if (!response.success) {
      throw new Error(response.message || response.error || 'Failed to cancel subscription');
    }
    await refreshAll();
    return response;
  }, [refreshAll]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Wait for farm country so we don't flash Uganda (UGX / MoMo) for international farms
      if (!countryCode) {
        setLoading(true);
        try {
          await fetchStatus();
        } catch (err) {
          if (mounted) {
            setError(err instanceof Error ? err.message : 'Failed to load billing data');
          }
        }
        return;
      }
      setLoading(true);
      try {
        await Promise.all([fetchStatus(), fetchPlans(countryCode)]);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load billing data');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [countryCode, fetchPlans, fetchStatus]);

  return {
    status,
    plans,
    billingMeta,
    history,
    loading: loading || !countryCode,
    historyLoading,
    error,
    refresh,
    refreshAll,
    fetchHistory,
    cancelSubscription,
    setError,
    countryCode: countryCode || 'UG',
  };
}
