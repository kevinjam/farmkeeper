'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronRight, User, Building2, KeyRound, Loader2, CheckCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

type UserProfile = { name: string; email: string; image?: string | null };
type FarmLocation = { address?: string; district?: string; country?: string };
type FarmSettings = { name: string; location: FarmLocation };

export default function ProfileSettingsPage({ params }: { params: { farmId: string } }) {
  const router = useRouter();
  const farmSlug = params.farmId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [farm, setFarm] = useState<FarmSettings | null>(null);

  const [farmForm, setFarmForm] = useState<FarmSettings>({
    name: '',
    location: { address: '', district: '', country: 'Uganda' },
  });

  const getAuthHeaders = (): HeadersInit => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage(null);
      try {
        const [statusRes, farmRes] = await Promise.all([
          fetch(`${API_BASE}/api/auth/status`, { credentials: 'include', headers: getAuthHeaders() }),
          fetch(`${API_BASE}/api/farms/${farmSlug}/settings`, { credentials: 'include', headers: getAuthHeaders() }),
        ]);

        if (cancelled) return;

        if (!statusRes.ok) {
          router.replace('/en/auth/login');
          return;
        }

        const statusData = await statusRes.json();
        if (statusData.user) {
          setUser({
            name: statusData.user.name || '',
            email: statusData.user.email || '',
            image: statusData.user.image,
          });
        }

        if (farmRes.ok && statusData.farm) {
          const farmData = await farmRes.json();
          const d = farmData.data || farmData;
          const loc = d.location || {};
          setFarm({
            name: d.name || statusData.farm.name || '',
            location: {
              address: loc.address || '',
              district: loc.district || '',
              country: loc.country || 'Uganda',
            },
          });
          setFarmForm({
            name: d.name || statusData.farm.name || '',
            location: {
              address: loc.address || '',
              district: loc.district || '',
              country: loc.country || 'Uganda',
            },
          });
        } else if (statusData.farm) {
          setFarm({ name: statusData.farm.name || '', location: { country: 'Uganda' } });
          setFarmForm({ name: statusData.farm.name || '', location: { country: 'Uganda' } });
        }
      } catch (e) {
        if (!cancelled) setMessage({ type: 'error', text: 'Failed to load profile.' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [farmSlug, router]);

  const handleFarmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setFarmForm((prev) => ({ ...prev, name: value }));
    } else {
      setFarmForm((prev) => ({
        ...prev,
        location: { ...prev.location, [name]: value },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/farms/${farmSlug}/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: farmForm.name,
          location: farmForm.location,
        }),
      });
      const data = res.ok ? await res.json() : null;
      if (!res.ok) {
        const err = (data?.details?.[0]?.msg) || data?.error || 'Update failed';
        setMessage({ type: 'error', text: err });
        return;
      }
      setFarm({ ...farmForm });
      setMessage({ type: 'success', text: 'Profile saved successfully.' });
      setTimeout(() => setMessage(null), 4000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to save. Try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
        <Link
          href={`/${farmSlug}/dashboard/settings`}
          className="hover:text-primary-600 dark:hover:text-primary-400"
        >
          Settings
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="text-gray-900 dark:text-white font-medium">Profile</span>
      </nav>

      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your personal and farm information.
          </p>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 shrink-0" />
            ) : (
              <span className="w-5 h-5 shrink-0 rounded-full bg-current opacity-70" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal information (read-only from auth) */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                  <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Personal information</CardTitle>
                  <CardDescription>Your account details from sign-in.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-gray-200 dark:border-gray-700">
                  <AvatarImage src={user?.image || undefined} alt={user?.name} />
                  <AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 text-lg">
                    {user?.name?.slice(0, 2).toUpperCase() || 'FK'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Label className="text-gray-500 dark:text-gray-400">Name</Label>
                  <p className="mt-0.5 text-base font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || '—'}
                  </p>
                  <Label className="text-gray-500 dark:text-gray-400 mt-2 block">Email</Label>
                  <p className="mt-0.5 text-base text-gray-900 dark:text-white truncate">
                    {user?.email || '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Farm details (editable) */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                  <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Farm details</CardTitle>
                  <CardDescription>Update your farm name and location.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="farm-name">Farm name</Label>
                <Input
                  id="farm-name"
                  name="name"
                  value={farmForm.name}
                  onChange={handleFarmChange}
                  placeholder="e.g. Green Valley Farm"
                  disabled={saving}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location-address">Address</Label>
                  <Input
                    id="location-address"
                    name="address"
                    value={farmForm.location.address || ''}
                    onChange={handleFarmChange}
                    placeholder="Street or area"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location-district">District</Label>
                  <Input
                    id="location-district"
                    name="district"
                    value={farmForm.location.district || ''}
                    onChange={handleFarmChange}
                    placeholder="e.g. Kampala"
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location-country">Country</Label>
                <Input
                  id="location-country"
                  name="country"
                  value={farmForm.location.country || ''}
                  onChange={handleFarmChange}
                  placeholder="e.g. Uganda"
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Change password (informational for now) */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <KeyRound className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Password</CardTitle>
                  <CardDescription>
                    To change your password, sign out and use “Forgot password” on the login page, or contact support.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Link href={`/${farmSlug}/dashboard`}>
              <Button type="button" variant="outline" disabled={saving}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
