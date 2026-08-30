'use client';

import { useEffect } from 'react';

const INTERVAL_MS = 2 * 60 * 1000;

/** Keeps lastSeenAt fresh while the farmer dashboard is open. */
export function PresenceHeartbeat() {
  useEffect(() => {
    const ping = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/auth/status`, {
        credentials: 'include',
        cache: 'no-store',
        headers,
      }).catch(() => undefined);
    };

    const id = window.setInterval(ping, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
