'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

// Updated interfaces to match your backend
interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'worker';
  picture?: string;
  authMethod: 'local' | 'google';
  isNewUser: boolean;
}

interface BackendFarm {
  id: string;
  name: string;
  slug: string;
  plan: 'basic' | 'standard' | 'premium';
}

interface GoogleSignInNextScriptProps {
  onSuccess?: (user: BackendUser, farm?: BackendFarm) => void;
  onError?: (error: string) => void;
  enableFarmSetup?: boolean;
  defaultFarmName?: string;
  defaultPlan?: 'basic' | 'standard' | 'premium';
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

/**
 * Google Sign-In Component using Next.js Script component
 * This approach is more reliable and handles CORS issues better
 */
export default function GoogleSignInNextScript({ 
  onSuccess, 
  onError, 
  enableFarmSetup = false,
  defaultFarmName = '',
  defaultPlan = 'basic'
}: GoogleSignInNextScriptProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { login } = useGoogleAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBrowser, setIsBrowser] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  // Farm setup state for new users
  const [showFarmSetup, setShowFarmSetup] = useState(false);
  const [farmName, setFarmName] = useState(defaultFarmName);
  const [plan, setPlan] = useState<'basic' | 'standard' | 'premium'>(defaultPlan);
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    if (scriptLoaded && !isInitialized) {
      initializeGoogleSignIn();
    }
  }, [scriptLoaded, isInitialized]);

  const initializeGoogleSignIn = () => {
    if (typeof window === 'undefined' || !window.google?.accounts?.id) {
      setError('Google SDK not available');
      return;
    }

    if (!buttonRef.current || isInitialized) {
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
    if (!clientId) {
      setError('Google OAuth Client ID not configured');
      return;
    }

    try {
      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Clear and render button
      if (buttonRef.current) {
        buttonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 300,
        });
      }
      
      setIsInitialized(true);
    } catch (err) {
      console.error('Error initializing Google Sign-In:', err);
      setError('Failed to initialize Google Sign-In');
    }
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const idToken = response.credential;
      if (!idToken) {
        throw new Error('No ID token received from Google');
      }
      // Save ID token for potential follow-up farm setup
      setPendingIdToken(idToken);

      // Prepare request body
      const requestBody: any = { token: idToken };
      
      if (enableFarmSetup && farmName) {
        requestBody.farmName = farmName;
        requestBody.plan = plan;
      }

      // Send to frontend API route which forwards to backend and sets cookie
      const backendResponse = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      const data = await backendResponse.json();

      if (!backendResponse.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Login user
      login(data.user, data.token, data.farm);

      // Call success callback
      if (onSuccess) {
        onSuccess(data.user, data.farm);
      }

      // Handle user flow
      if (data.user.isNewUser) {
        if (data.farm) {
          router.push(`/${data.farm.slug}/dashboard`);
        } else {
          if (enableFarmSetup) {
            setShowFarmSetup(true);
          } else {
            router.push('/setup-profile');
          }
        }
      } else {
        if (data.farm) {
          router.push(`/${data.farm.slug}/dashboard`);
        } else {
          router.push('/dashboard');
        }
      }

    } catch (err) {
      console.error('Google Sign-In error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFarmSetup = async () => {
    if (!farmName.trim()) {
      setError('Farm name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      if (!pendingIdToken) {
        throw new Error('Google authentication not available. Please sign in again.');
      }

      // Call the same Google auth route with farm details to create the farm
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token: pendingIdToken, farmName, plan }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Farm setup failed');
      }

      // Persist and redirect
      if (data.user && data.token) {
        login(data.user, data.token, data.farm);
      }
      if (data.farm) {
        localStorage.setItem('farm_info', JSON.stringify(data.farm));
      }
      router.push(`/${data.farm.slug}/dashboard`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Farm setup failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isBrowser) {
    return (
      <div className="flex justify-center min-h-[40px] border border-gray-200 rounded-md p-2">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Load Google Script using Next.js Script component */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Google script loaded successfully');
          setScriptLoaded(true);
        }}
        onError={(e) => {
          console.error('Google script failed to load:', e);
          setError('Failed to load Google authentication script. Please check your internet connection and try again.');
        }}
      />

      <div className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* Farm Setup Form for New Users */}
        {showFarmSetup && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Complete Your Farm Setup</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="farmName" className="block text-sm font-medium text-gray-700">
                  Farm Name
                </label>
                <input
                  type="text"
                  id="farmName"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your farm name"
                />
              </div>
              <div>
                <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                  Subscription Plan
                </label>
                <select
                  id="plan"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as 'basic' | 'standard' | 'premium')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <button
                onClick={handleFarmSetup}
                disabled={isLoading || !farmName.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}
        
        {/* Google Sign-In Button Container */}
        <div ref={buttonRef} className="flex justify-center min-h-[40px] border border-gray-200 rounded-md p-2">
          {!scriptLoaded && (
            <div className="text-gray-500 text-sm">
              Loading Google Sign-In...
            </div>
          )}
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="text-center text-gray-600">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Authenticating...
          </div>
        )}
      </div>
    </>
  );
}


